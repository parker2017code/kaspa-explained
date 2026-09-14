#!/usr/bin/env bash
# Reproduce CI exactly: clone this repo at HEAD into an isolated temp
# directory and run the publish gate there.
#
# The pre-commit hook (.githooks/pre-commit) checks the staged tree of a
# single commit, which is the right, cheap check to run on every commit. It
# cannot catch everything CI can see: a clean clone also exercises whatever
# is actually reachable from HEAD across the whole ref, with none of the
# current worktree's untracked files, ignored files, or local-only state in
# reach. CI checks out a fresh clone and nothing else; this does the same
# thing, locally, before the push leaves the machine.
#
# Usage: bash scripts/check-clean-clone.sh
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

head_sha="$(git rev-parse HEAD)"
clone_dir="$(mktemp -d "${TMPDIR:-/tmp}/kaspa-clean-clone.XXXXXX")"
cleanup() { rm -rf "$clone_dir"; }
trap cleanup EXIT

echo "check-clean-clone: cloning $repo_root at HEAD ($head_sha) into $clone_dir"
git clone --quiet --local --no-hardlinks "$repo_root" "$clone_dir"

echo "check-clean-clone: running scripts/check-site.sh against the clean clone..."
(cd "$clone_dir" && bash scripts/check-site.sh)

echo "check-clean-clone: passed. HEAD ($head_sha) is clean-clone safe."
