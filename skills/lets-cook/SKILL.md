---
name: lets-cook
description: Which skill or pipeline fits the task in front of Aaron, and whether it deserves a multi-agent fan-out. Aaron types /lets-cook with the task; nothing fires it on its own.
disable-model-invocation: true
---

# lets-cook

Read the task, pick the route from the table, reply in the format below, then wait. Do not start the work. On "go", invoke the first skill. On "go ultra", design and run the Fan-out line's plan as a workflow.

## Reply format

```
Task: <what this is, one line>
Route: <skill> → <skill> (<why, a clause each>)
Fan-out: no | <plan in a few words>, ~<N> agents, reply "go ultra"
Type: /<skill> <args>   or   "go"
```

Five lines, no more. One route, not a menu. If the task is two tasks, say so and route the first.

## Fan-out rule

A workflow earns its cost for one of two reasons. Otherwise sequential.

- **Scale**: five or more independent slices (packages, files, review lenses, partner surfaces), each needing real reading, not a grep, none depending on another's result.
- **Confidence**: a wrong answer is expensive and no runnable check can prove it. When a test or command can prove it, route to that instead.

Design the workflow for the task: readers per slice, a skill as a stage, skeptics who try to break a claim, judges picking between drafts. Combine and invent freely. Example Fan-out line: `diagnosing-bugs, then 3 agents try to break its root cause, ~4 agents`.

A stage can run any model-invoked skill (tested 2026-09-30), within three limits:

- Stages have no Agent tool, so a skill that fans out on its own (ce-code-review, ce-plan) runs single-agent there. Run those from the main session; a review or a plan alone is never a reason for a workflow.
- Stages cannot ask Aaron anything. Interactive skills (ce-brainstorm, grill-me) stay in the main session.
- A workflow runs start to finish without stops. One workflow per phase keeps Aaron's go between phases.

## Routing table

**Before code**

| Task looks like | Route |
|---|---|
| Vague idea, "should we", what to build | `ce-brainstorm` → `grill-me` on the requirements doc it wrote → `ce-plan` |
| Known ticket or feature to plan | `ce-plan` → `ce-work` |
| Adopt or switch to library or platform X | `ce-pov` |
| Options or ideas wanted | `ce-ideate` |
| Why is this code shaped this way, where did this number come from | `why` (git first; fans out only if git leaves it open) |
| How does X work, teach me | `ce-explain` |
| TRD or design doc: draft, polish, PM-readable | `trd-editor`; from scratch → offer `grill-me` first |
| Review a plan, spec, or requirements doc | `ce-doc-review` |
| Epic too big for one session, mostly other people's decisions | `wayfinder` on the epic branch; map and tickets live in `.scratch/<epic>/` as local markdown, never Jira. When nothing is left to decide: `to-spec` → `to-tickets` → `implement-spec` if the build splits into several independent tickets, else `ce-plan` → `ce-work` |

**Build**

| Task looks like | Route |
|---|---|
| Implement from a plan or spec | `ce-work`; hands-off all the way to a PR → `lfg` |
| Tickets from `to-tickets` under `.scratch/<feature>/issues/` | `implement-spec`, told the tracker is local markdown in `.scratch/<feature>/`. Never `/setup-matt-pocock-skills`: it edits the repo's CLAUDE.md |
| Bug with an error, trace, or failing test | `ce-debug` |
| Hard, flaky, or slow bug; repro unclear | `diagnosing-bugs` |
| See a UI change in a real browser | `webapp-testing`; zero-setup smoke → `ce-test-browser` |
| Settled code feels heavy | `ce-simplify-code` |
| Read an external repo or dependency source | `repo-explorer` |

**Review and ship**

| Task looks like | Route |
|---|---|
| Review my own diff before a PR | Pick the better fit. `ce-code-review` hunts bugs through many reviewer lenses: the default, pass `plan:<path>` when a plan exists. `code-review` against `main` checks the diff did what the spec asked, plus code smells: pick it when the work came from `to-spec`, and tell it the spec is in `.scratch/<feature>/`. Diff touches shared code, a schema, or a dep → `blast-radius` too |
| Review someone else's PR | `/review-pr` with `aaron-review` as the lens |
| Commit | `ce-commit` |
| Open the PR | `ce-commit-push-pr` (`no-comments` runs first on its own) |
| Watch a PR to green | `review-loop` (never merges) or `ce-babysit-pr` |
| Address review comments | `ce-resolve-pr-feedback` |
| Capture what we learned | `ce-compound` |
| Session went sideways, fix the setup so it doesn't recur | `retro`, in that session before clearing |
| Hand this session to another agent | `ce-handoff` |

**Prose and ops**

| Task looks like | Route |
|---|---|
| Any doc, PR body, commit message, TRD going out | `unslop` last |
| Meeting notes to record | CLAUDE.md "Recording notes" rule, no skill |
| Slack catch-up or digest | `slack:summarize-channel`, `slack:find-discussions` |
| Editing a skill, CLAUDE.md, or an agent file | `writing-for-agents` (from the mattpocock-skills plugin) |

No row fits: say so in the Route line and name the nearest two.
