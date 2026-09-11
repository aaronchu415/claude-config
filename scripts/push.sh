#!/usr/bin/env bash
# Commit and push ~/.claude to github.com/aaronchu415/claude-config.
# gh's active account is the work one and the SSH key is work too, so the push
# runs under the personal account and switches back afterwards.
# Usage: scripts/push.sh ["commit message"] [--dry-run]
set -euo pipefail
cd "$HOME/.claude"
msg="update"; dry=""
for a in "$@"; do case "$a" in --dry-run) dry="--dry-run" ;; *) msg="$a" ;; esac; done

scripts/export-plugins.sh >/dev/null
git add -A
if [[ -z "$dry" ]] && ! git diff --cached --quiet; then git commit -q -m "$msg"; fi

work=$(gh api user -q .login 2>/dev/null || true)
gh auth switch --user aaronchu415 >/dev/null
trap '[[ -n "$work" ]] && gh auth switch --user "$work" >/dev/null' EXIT
git push $dry origin main
