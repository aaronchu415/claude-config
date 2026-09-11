---
name: lets-cook
description: Which skill or pipeline fits the task in front of Aaron, and whether it deserves a multi-agent fan-out. Aaron types /lets-cook with the task; nothing fires it on its own.
disable-model-invocation: true
---

# lets-cook

Read the task, pick the route from the table, reply in the format below, then wait. Do not start the work. On "go", invoke the first skill. On "go ultra", the task is opted into a dynamic workflow.

## Reply format

```
Task: <what this is, one line>
Route: <skill> → <skill> (<why, a clause each>)
Fan-out: no | yes, <N> independent <slices>, reply "go ultra"
Type: /<skill> <args>   or   "go"
```

Five lines, no more. One route, not a menu. If the task is two tasks, say so and route the first.

## Fan-out rule

A dynamic workflow (ultracode) earns its cost only when all three hold: five or more independent slices (packages, files, review lenses, partner surfaces); each slice needs real reading, not a grep; the slices do not depend on each other's results. Otherwise sequential. Fan-out spawns 10 to 15 agents; say that in the Fan-out line when recommending it. ce-code-review and ce-plan already fan out internally, so a review or a plan is never itself a reason for ultracode.

## Routing table

**Before code**

| Task looks like | Route |
|---|---|
| Vague idea, "should we", what to build | `ce-brainstorm`; design branches still open → `grill-me` first |
| Known ticket or feature to plan | `ce-plan` → `ce-work` |
| Adopt or switch to library or platform X | `ce-pov` |
| Options or ideas wanted | `ce-ideate` |
| Why is this code shaped this way, where did this number come from | `why` (git first; fans out only if git leaves it open) |
| How does X work, teach me | `ce-explain` |
| TRD or design doc: draft, polish, PM-readable | `trd-editor`; from scratch → offer `grill-me` first |
| Review a plan, spec, or requirements doc | `ce-doc-review` |
| Epic too big for one session, mostly other people's decisions | `wayfinder` on the epic branch; map and tickets live in `.scratch/<epic>/` as local markdown, never Jira. Hands off to `ce-plan` when nothing is left to decide |

**Build**

| Task looks like | Route |
|---|---|
| Implement from a plan or spec | `ce-work`; hands-off all the way to a PR → `lfg` |
| Bug with an error, trace, or failing test | `ce-debug` |
| Hard, flaky, or slow bug; repro unclear | `diagnosing-bugs` |
| See a UI change in a real browser | `webapp-testing`; zero-setup smoke → `ce-test-browser` |
| Settled code feels heavy | `ce-simplify-code` |
| Read an external repo or dependency source | `repo-explorer` |

**Review and ship**

| Task looks like | Route |
|---|---|
| Review my own diff before a PR | `ce-code-review`; diff touches shared code, a schema, or a dep → `blast-radius` too |
| Review someone else's PR | `/review-pr` with `aaron-review` as the lens |
| Commit | `ce-commit` |
| Open the PR | `ce-commit-push-pr` (`no-comments` runs first on its own) |
| Watch a PR to green | `review-loop` (never merges) or `ce-babysit-pr` |
| Address review comments | `ce-resolve-pr-feedback` |
| Capture what we learned | `ce-compound` |
| Hand this session to another agent | `ce-handoff` |

**Prose and ops**

| Task looks like | Route |
|---|---|
| Any doc, PR body, commit message, TRD going out | `unslop` last |
| Meeting notes to record | CLAUDE.md "Recording notes" rule, no skill |
| Slack catch-up or digest | `slack:summarize-channel`, `slack:find-discussions` |
| Editing a skill, CLAUDE.md, or an agent file | `writing-for-agents` (from the mattpocock-skills plugin) |

No row fits: say so in the Route line and name the nearest two.
