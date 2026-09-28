#!/usr/bin/env python3
"""Copy the accepted static site into the Cloudflare asset directory."""

from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
SKIP_DIRS = {
    ".cache",
    ".claude",
    ".codex",
    "dist",
    ".git",
    ".local",
    "_preview-site",
    "exports",
    "node_modules",
    "visual-audit",
    ".wrangler",
}
PUBLIC_EXTENSIONS = {
    ".epub",
    ".css",
    ".gif",
    ".html",
    ".ico",
    ".jpeg",
    ".jpg",
    ".js",
    ".pdf",
    ".png",
    ".svg",
    ".wasm",
    ".webmanifest",
    ".webp",
}
PUBLIC_NAMES = {".nojekyll", "CNAME", "llms.txt", "robots.txt", "sitemap.xml"}
PUBLIC_SOURCE_FILES = {
    "agent-index.json",
    "site-manifest.json",
    "CONTENT_BRIEF.md",
    "README.md",
    "CLAIMS.yml",
}


def is_public(path: Path) -> bool:
    return (
        path.name in PUBLIC_NAMES
        or path.suffix.lower() in PUBLIC_EXTENSIONS
        or path.relative_to(ROOT).as_posix() in PUBLIC_SOURCE_FILES
    )


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    copied = 0
    for path in ROOT.rglob("*"):
        relative = path.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in relative.parts):
            continue
        if not path.is_file() or not is_public(path):
            continue
        target = DIST / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        copied += 1
    print(f"Copied {copied} public static files to {DIST.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
