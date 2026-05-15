#!/usr/bin/env bash
set -euo pipefail

browser="${BROWSER:-}"
if [[ -n "$browser" && "$browser" != *chrom* ]]; then
  browser=""
fi
if [[ -z "$browser" ]]; then
  for candidate in /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/google-chrome; do
    if [[ -x "$candidate" ]]; then
      browser="$candidate"
      break
    fi
  done
fi
if [[ -z "$browser" ]]; then
  browser="$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)"
fi

if [[ -z "$browser" ]]; then
  echo "Rendered layout check skipped: no Chromium-compatible browser found." >&2
  exit 0
fi

tmp_dir="$(mktemp -d)"
cleanup() {
  if [[ -n "${server_pid:-}" ]]; then
    kill "$server_pid" 2>/dev/null || true
  fi
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

python3 -m http.server 4183 >/tmp/kaspa-explained-render-server.log 2>&1 &
server_pid="$!"

for _ in {1..40}; do
  if curl -fsS "http://127.0.0.1:4183/" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

pages=(
  "index.html"
  "start-here.html"
  "kaspa-in-one-screen.html"
  "skeptical-case.html"
  "reality-check.html"
  "command-line.html"
  "builder-guide.html"
  "status.html"
  "sources.html"
)

for page in "${pages[@]}"; do
  "$browser" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --window-size=390,844 \
    --screenshot="$tmp_dir/${page%.html}-mobile.png" \
    "http://127.0.0.1:4183/$page" >/dev/null 2>&1
  [[ -s "$tmp_dir/${page%.html}-mobile.png" ]] || {
    echo "Rendered mobile screenshot failed for $page" >&2
    exit 1
  }

  "$browser" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --window-size=1280,900 \
    --screenshot="$tmp_dir/${page%.html}-desktop.png" \
    "http://127.0.0.1:4183/$page" >/dev/null 2>&1
  [[ -s "$tmp_dir/${page%.html}-desktop.png" ]] || {
    echo "Rendered desktop screenshot failed for $page" >&2
    exit 1
  }
done

for theme in light dark; do
  for viewport in "390,844:mobile" "1280,900:desktop"; do
    IFS=":" read -r size label <<< "$viewport"
    "$browser" \
      --headless=new \
      --disable-gpu \
      --no-sandbox \
      --hide-scrollbars \
      --window-size="$size" \
      --screenshot="$tmp_dir/index-${theme}-${label}.png" \
      "http://127.0.0.1:4183/index.html?theme=$theme" >/dev/null 2>&1
    [[ -s "$tmp_dir/index-${theme}-${label}.png" ]] || {
      echo "Rendered $theme $label screenshot failed for index.html" >&2
      exit 1
    }
  done
done

echo "Rendered layout screenshots passed. pages=${#pages[@]} themes=2"
