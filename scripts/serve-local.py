#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse


class CleanUrlHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        translated = Path(super().translate_path(path))
        if translated.exists() or translated.suffix:
            return str(translated)

        html_file = translated.with_suffix(".html")
        if html_file.exists():
            return str(html_file)

        index_file = translated / "index.html"
        if index_file.exists():
            return str(index_file)

        return str(translated)


def main():
    parser = argparse.ArgumentParser(description="Serve Kaspa Explained locally with clean URL fallback.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8783, type=int)
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), CleanUrlHandler)
    print(f"Serving clean URLs at http://{args.host}:{args.port}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
