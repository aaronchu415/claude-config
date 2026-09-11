#!/usr/bin/env bash
# Writes ~/.claude/plugins.json: installed plugins with version, commit, and marketplace source.
# A lock file for restores; no local paths.
set -euo pipefail
jq -n --slurpfile i "$HOME/.claude/plugins/installed_plugins.json" --slurpfile m "$HOME/.claude/plugins/known_marketplaces.json" '
  ($m[0] | to_entries | map({key: .key, value: .value.source}) | from_entries) as $src
  | $i[0].plugins | to_entries
  | map({ key: .key,
          value: { version: .value[0].version, commit: .value[0].gitCommitSha,
                   marketplace: (.key | split("@")[1]),
                   source: $src[(.key | split("@")[1])] } })
  | from_entries
' > "$HOME/.claude/plugins.json"
echo "wrote $HOME/.claude/plugins.json ($(jq 'keys|length' "$HOME/.claude/plugins.json") plugins)"
