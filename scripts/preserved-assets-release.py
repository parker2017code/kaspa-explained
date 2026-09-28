#!/usr/bin/env python3
"""Prepare or deploy a reviewed Worker update without replacing unknown live assets.

Prepare compares the public build with the current custom domain and writes a
module bundle plus a reviewable manifest. Every tracked text asset is included:
live bytes may come from the outgoing Worker rather than the retained ASSETS
binding. Deploy requires that exact prepared bundle, unchanged source bytes,
and the same Cloudflare production version.
"""

import argparse
import concurrent.futures
import hashlib
import json
import mimetypes
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import uuid


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
WORKER = ROOT / "cloudflare" / "entry.mjs"
CONFIG = ROOT / "cloudflare" / "wrangler.jsonc"
ACCOUNT_ID = "12418158839e0c1880a7f3fa8678bcfd"
SCRIPT_NAME = "kaspa-explained"
API = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/workers/scripts/{SCRIPT_NAME}"
SITE = "https://kaspaexplained.com"
ALWAYS_OVERRIDE = {"satoshis-engine.epub"}  # Currently served from a Worker module, not ASSETS.
TEXT_EXTENSIONS = {
    ".html", ".css", ".js", ".svg", ".json", ".yml", ".yaml", ".md",
    ".txt", ".xml", ".webmanifest",
}
TEXT_NAMES = {"CNAME"}
ADVERTISED_SOURCE_FILES = {
    "agent-index.json", "site-manifest.json", "CONTENT_BRIEF.md", "README.md", "CLAIMS.yml"
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def oauth_token():
    config = Path.home() / "Library/Preferences/.wrangler/config/default.toml"
    match = re.search(r'^oauth_token\s*=\s*"([^"]+)"', config.read_text(), re.MULTILINE)
    if not match:
        raise RuntimeError("Existing Wrangler OAuth login was not found")
    return match.group(1)


def api_json(path, method="GET", body=None, content_type=None):
    headers = {"Authorization": "Bearer " + oauth_token()}
    if content_type:
        headers["Content-Type"] = content_type
    request = urllib.request.Request(API + path, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        # Never print the response body: it may contain account data or credentials.
        raise RuntimeError(f"Cloudflare API returned HTTP {error.code}") from None
    if not result.get("success"):
        raise RuntimeError("Cloudflare API did not report success")
    return result["result"]


def current_version():
    deployments = api_json("/deployments")["deployments"]
    if not deployments:
        raise RuntimeError("No production deployment was returned")
    latest = max(deployments, key=lambda item: item["created_on"])
    versions = latest.get("versions", [])
    if len(versions) != 1:
        raise RuntimeError("Latest deployment has an unexpected version set")
    return versions[0]["version_id"]


def assert_version(expected):
    actual = current_version()
    if actual != expected:
        raise RuntimeError(f"Production version changed: expected {expected}, found {actual}")
    version = api_json(f"/versions/{expected}")
    bindings = version["resources"]["bindings"]
    types = {binding["type"] for binding in bindings}
    if types - {"assets", "secret_text"} or not any(
        binding["type"] == "assets" and binding["name"] == "ASSETS" for binding in bindings
    ):
        raise RuntimeError("Production binding types changed; review the release metadata")


def check_public_contract():
    manifest = json.loads((ROOT / "site-manifest.json").read_text())
    for name in manifest["requiredFiles"]:
        if not (ROOT / name).is_file():
            raise RuntimeError(f"Required source file is missing: {name}")
    advertised = set(manifest["pages"] + manifest["demos"] + manifest["sitemapExtraFiles"]
                     + manifest.get("standalonePages", []))
    advertised |= ADVERTISED_SOURCE_FILES
    for name in sorted(advertised):
        if not (DIST / name).is_file():
            raise RuntimeError(f"Advertised public file is missing from dist: {name}")
    for private in ("AGENTS.md", "WORKING-STATE.md", ".github/workflows/site-check.yml"):
        if (DIST / private).exists():
            raise RuntimeError(f"Private file entered dist: {private}")
    tracked = set(subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0"))
    for path in DIST.rglob("*"):
        if path.is_file() and path.relative_to(DIST).as_posix() not in tracked:
            raise RuntimeError(f"Untracked public file entered dist: {path.relative_to(DIST)}")
    instrument = (DIST / "the-instrument.html").read_bytes()
    if digest(instrument) != "b5959f92e6d3486b43f3ed984e0578c066e410a23903e84e1017d202602df10c":
        raise RuntimeError("Guest Instrument differs from the recovered production bytes")


def live_bytes(relative, nonce):
    encoded = urllib.parse.quote(relative, safe="/")
    url = f"{SITE}/{encoded}?verify=preserved-{nonce}"
    with tempfile.TemporaryDirectory(prefix="kaspa-live-") as directory:
        output = Path(directory) / "body"
        command = ["curl", "--silent", "--show-error", "--location", "--max-time", "25",
                   "--output", str(output), "--write-out", "%{http_code}", url]
        response = subprocess.run(command, capture_output=True, text=True, timeout=30)
        if response.returncode:
            raise RuntimeError(f"Live fetch failed for {relative}: curl exit {response.returncode}")
        try:
            status = int(response.stdout)
        except ValueError:
            raise RuntimeError(f"Live fetch returned no status for {relative}") from None
        if status not in (200, 404):
            raise RuntimeError(f"Live fetch returned HTTP {status} for {relative}")
        return status, output.read_bytes()


def content_type(path):
    extension = Path(path).suffix.lower()
    explicit = {
        ".epub": "application/epub+zip",
        ".html": "text/html; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".md": "text/markdown; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
        ".yml": "text/yaml; charset=utf-8",
        ".yaml": "text/yaml; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
    }
    return explicit.get(extension) or mimetypes.guess_type(path)[0] or "application/octet-stream"


def build_registry(changed, stage):
    imports = []
    entries = []
    module_files = []
    for number, record in enumerate(changed):
        name = f"asset-{number:04d}.bin"
        shutil.copyfile(DIST / record["path"], stage / name)
        imports.append(f"import asset{number} from './{name}';")
        options = {"body": f"asset{number}", "contentType": record["content_type"]}
        if record["path"] == "satoshis-engine.epub":
            options["contentDisposition"] = 'attachment; filename="Satoshis_Engine.epub"'
            options["cacheControl"] = "public, max-age=3600"
        attributes = ", ".join(key + ": " + (value if key == "body" else json.dumps(value))
                                for key, value in options.items())
        entries.append(f"  {json.dumps('/' + record['path'])}: {{ {attributes} }},")
        module_files.append(name)
    registry = "\n".join(imports + ["export const overrides = Object.freeze({"] + entries + ["});", ""])
    (stage / "release-overrides.mjs").write_text(registry)
    shutil.copyfile(WORKER, stage / "entry.mjs")
    return module_files


def prepare(args):
    assert_version(args.expected_version)
    stage = args.output.resolve()
    if stage.exists() and any(stage.iterdir()):
        raise RuntimeError(f"Stage directory is not empty: {stage}")
    subprocess.run([sys.executable, "scripts/build-static-dist.py"], cwd=ROOT, check=True)
    check_public_contract()
    files = sorted(path for path in DIST.rglob("*") if path.is_file())
    nonce = args.expected_version[:8]

    def compare(path):
        relative = path.relative_to(DIST).as_posix()
        local = path.read_bytes()
        status, remote = live_bytes(relative, nonce)
        equal = status == 200 and digest(local) == digest(remote)
        text_asset = path.suffix.lower() in TEXT_EXTENSIONS or path.name in TEXT_NAMES
        selected = text_asset or relative in ALWAYS_OVERRIDE or not equal
        return {"path": relative, "status": status, "source_sha256": digest(local),
                "live_sha256": digest(remote) if status == 200 else None,
                "size": len(local), "content_type": content_type(relative),
                "live_equal": equal, "override": selected,
                "reason": "tracked_text" if text_asset else ("forced_module" if relative in ALWAYS_OVERRIDE else "different_bytes")}

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        results = sorted(pool.map(compare, files), key=lambda item: item["path"])
    changed = [item for item in results if item["override"]]
    stage.mkdir(parents=True, exist_ok=True)
    modules = build_registry(changed, stage)
    bundle_files = ["entry.mjs", "release-overrides.mjs"] + modules
    bundle_snapshot = {name: digest((stage / name).read_bytes()) for name in bundle_files}
    snapshots = {"cloudflare/entry.mjs": digest(WORKER.read_bytes()),
                 "cloudflare/wrangler.jsonc": digest(CONFIG.read_bytes()),
                 "scripts/build-static-dist.py": digest((ROOT / "scripts/build-static-dist.py").read_bytes())}
    snapshots.update({item["path"]: item["source_sha256"] for item in results})
    report = {"expected_version": args.expected_version, "site": SITE, "source_snapshot": snapshots,
              "checked_files": len(results), "byte_equal_files": sum(item["live_equal"] for item in results),
              "retained_fallback_files": len(results) - len(changed),
              "retained_sample": [item["path"] for item in results if not item["override"]][:5],
              "changed": changed, "modules": modules, "bundle_snapshot": bundle_snapshot,
              "keep_assets": True,
              "unknown_live_paths_retained": True}
    (stage / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"stage": str(stage), "version": args.expected_version,
                      "checked_files": len(results), "override_count": len(changed),
                      "remote_differences": [item["path"] for item in changed if not item["live_equal"]]}, indent=2))


def multipart(stage, report):
    config = json.loads(CONFIG.read_text())
    metadata = {"main_module": "entry.mjs", "compatibility_date": config["compatibility_date"],
                "keep_assets": True, "keep_bindings": ["secret_text"],
                "bindings": [{"name": "ASSETS", "type": "assets"}]}
    boundary = "kaspa-" + uuid.uuid4().hex
    parts = []

    def add(name, data, mime, filename=True):
        disposition = f'Content-Disposition: form-data; name="{name}"'
        if filename:
            disposition += f'; filename="{name}"'
        header = f"--{boundary}\r\n{disposition}\r\nContent-Type: {mime}\r\n\r\n"
        parts.append(header.encode() + data + b"\r\n")

    add("metadata", json.dumps(metadata).encode(), "application/json", filename=False)
    add("entry.mjs", (stage / "entry.mjs").read_bytes(), "application/javascript+module")
    add("release-overrides.mjs", (stage / "release-overrides.mjs").read_bytes(),
        "application/javascript+module")
    for name in report["modules"]:
        add(name, (stage / name).read_bytes(), "application/octet-stream")
    return b"".join(parts) + f"--{boundary}--\r\n".encode(), f"multipart/form-data; boundary={boundary}"


def validate_stage(stage):
    report = json.loads((stage / "report.json").read_text())
    if report["site"] != SITE or report["keep_assets"] is not True:
        raise RuntimeError("Stage does not describe a preserved-assets release")
    if len(report["changed"]) != len(report["modules"]):
        raise RuntimeError("Stage module count does not match its review manifest")
    for name, expected in report["source_snapshot"].items():
        if digest((ROOT / name).read_bytes()) != expected:
            raise RuntimeError(f"Source changed since preparation: {name}")
    for name, expected in report["bundle_snapshot"].items():
        if digest((stage / name).read_bytes()) != expected:
            raise RuntimeError(f"Prepared bundle changed: {name}")
    for item, name in zip(report["changed"], report["modules"]):
        if digest((stage / name).read_bytes()) != item["source_sha256"]:
            raise RuntimeError(f"Prepared module changed: {name}")
    if report["bundle_snapshot"]["entry.mjs"] != report["source_snapshot"]["cloudflare/entry.mjs"]:
        raise RuntimeError("Prepared Worker changed")
    assert_version(report["expected_version"])
    return report


def verify(args):
    stage = args.stage.resolve()
    report = validate_stage(stage)
    print(json.dumps({"ready": True, "version": report["expected_version"],
                      "override_count": len(report["changed"])}, indent=2))


def deploy(args):
    stage = args.stage.resolve()
    report = validate_stage(stage)
    body, content_type_header = multipart(stage, report)
    result = api_json("", method="PUT", body=body, content_type=content_type_header)
    print(json.dumps({"uploaded": True, "deployment_id": result.get("deployment_id"),
                      "override_paths": [item["path"] for item in report["changed"]]}, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    prepare_command = commands.add_parser("prepare")
    prepare_command.add_argument("--expected-version", required=True)
    prepare_command.add_argument("--output", type=Path, required=True)
    deploy_command = commands.add_parser("deploy")
    deploy_command.add_argument("--stage", type=Path, required=True)
    verify_command = commands.add_parser("verify")
    verify_command.add_argument("--stage", type=Path, required=True)
    args = parser.parse_args()
    try:
        {"prepare": prepare, "verify": verify, "deploy": deploy}[args.command](args)
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"Release preparation stopped: {error}", file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
