# claude-config

My Claude Code setup: global instructions, skills, agents, and output styles. `~/.claude` is the git repo itself; `.gitignore` is a whitelist, so sessions, credentials, caches, memory, and anything that has to name my employer never get committed.

## Workflow

Day to day I work in the [compound-engineering](https://github.com/EveryInc/compound-engineering-plugin) workflow: `ce-brainstorm` to scope, `ce-plan` to plan, `ce-work` to build, `ce-code-review` before a PR, `ce-commit-push-pr` to ship, `ce-compound` to capture what was learned. It is installed as a plugin, so its skills are not in this repo; `settings.json` enables it and `plugins.json` pins the version and commit.

The skills in this repo sit around that loop. Lost? `/lets-cook <task>` replies in five lines with which skill to use and whether a multi-agent fan-out is worth it.

- Before writing: `grill-me` (sharpen a plan), `why` (the history behind existing code).
- While reviewing: `aaron-review` (the quality bar), `test-designer` (which tests earn their keep), `blast-radius` (what a diff breaks elsewhere), `no-comments` (runs before every PR).
- When it breaks: `diagnosing-bugs`.
- Any prose: `unslop`.

Above the loop, for an epic too big for one session: `wayfinder` from [mattpocock/skills](https://github.com/mattpocock/skills), installed as the `mattpocock-skills` plugin so it tracks upstream, with only `wayfinder`, `grilling`, `domain-modeling`, `research`, `prototype`, and `writing-for-agents` switched on (`skillOverrides` in `settings.json` turns the other 19 off). Its map uses the local-markdown tracker on the epic branch.

Sources: `why`, `blast-radius`, `no-comments`, `unslop` from [cursor/plugins pstack](https://github.com/cursor/plugins/tree/main/pstack); `grill-me`, `diagnosing-bugs` from mattpocock/skills, copied and adapted rather than linked because they carry local changes. All ported to Claude Code and trimmed with Matt's `writing-for-agents` skill.

## What is here

| Path | What |
|---|---|
| `CLAUDE.md` | Global agent directives |
| `settings.json` | Permissions, hooks, plugins, marketplaces |
| `agents/` | Custom subagents (`comment-sicko`) |
| `skills/` | Skills: `why`, `blast-radius`, `no-comments`, `grill-me`, `diagnosing-bugs` (from cursor/plugins pstack and mattpocock/skills, ported to Claude Code), `unslop`, `repo-explorer`, `aaron-review`, `test-designer`, `webapp-testing` |
| `output-styles/` | `eli5`, `aaron-terse`, `ste` |
| `plugins.json` | Installed plugins pinned to version and commit, with marketplace source. Regenerate with `scripts/export-plugins.sh` |
| `statusline.sh` | Status line |

`hooks/`, `commands/` and `mcp-servers.json` stay local and are not backed up here: each one has to name my employer's repos, Jira prefix or vendors to do its job.

## Restore on a new machine

```bash
git clone git@github.com:aaronchu415/claude-config.git ~/.claude
cd ~/.claude/skills/webapp-testing && uv venv --python 3.13 .venv && .venv/bin/pip install playwright && .venv/bin/playwright install chromium
```

Then re-add the MCP servers with `claude mcp add` and log in to the plugins listed in `settings.json`.

## Update

```bash
~/.claude/scripts/push.sh "what changed"
```

It commits, pushes as my personal GitHub account, and switches `gh` back to the account it found active.
