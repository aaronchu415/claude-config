#!/usr/bin/env bash
# Writes ~/.claude/mcp-servers.json: every MCP server from ~/.claude.json (user + project scope),
# deduped by name, with env and header VALUES replaced by "<redacted>" so the file is safe to commit.
set -euo pipefail
jq '
  def redact: if . == null then null else map_values("<redacted>") end;
  [ (.mcpServers // {} | to_entries[]),
    (.projects // {} | to_entries[] | .value.mcpServers // {} | to_entries[]) ]
  | unique_by(.key)
  | map({ key: .key,
          value: (.value | {type: (.type // "stdio"), command, args, url}
                          + (if .env then {env: (.env | redact)} else {} end)
                          + (if .headers then {headers: (.headers | redact)} else {} end)
                          | with_entries(select(.value != null))) })
  | from_entries
' "$HOME/.claude.json" > "$HOME/.claude/mcp-servers.json"
echo "wrote $HOME/.claude/mcp-servers.json ($(jq 'keys|length' "$HOME/.claude/mcp-servers.json") servers)"
