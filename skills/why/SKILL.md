---
name: why
description: >-
  Design rationale of existing code or a past decision, when git blame alone
  cannot answer and the answer changes what gets built next: "why was X built
  this way", "why did we pick Y", "where did this threshold come from", the
  history behind a regression. Expensive (fans out to Jira, Confluence, Slack,
  Sentry), so it answers from git and gh first and fans out only when those
  leave the question open. Failing tests and runtime bugs go to
  diagnosing-bugs.
---

# why

What forces gave the code its shape. Read the code for what it does; run this for why.

Posture: careful, precise, honest about known versus inferred. `references/epistemics.md` is the confidence framework; whoever synthesizes follows it.

## Step 1. Target and question

The target is a chunk of code, a pattern, a feature, or a named decision. The question is a rationale, a tradeoff, a motivating edge case, an external constraint, dead code, or a history sweep. A vague target ("why do we do it this way?") gets your best guess from context, stated in one line so Aaron can redirect, then you proceed.

## Step 2. Anchor in git and gh, and try to stop here

```bash
git blame -L <start>,<end> <file>
git log --oneline -20 -- <file>          # PR numbers appear as (#1234)
git log --follow -p -- <file>
git log -1 --format=%B <commit>          # ticket keys appear as PROJ-nnnnn
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews
```

Capture the anchor: file paths, symbols, commit hashes, PR numbers, ticket keys.

**Build the timeline.** From `git log --follow -p`, list every change to the target in order: date, author, PR, and what shape it had before and after. The current code is the last frame of that film; the reason usually sits at the frame where the shape changed, not the latest one. Read the PR body and review thread at each turning point.

**Stop here and answer inline when the timeline, a PR body, its review thread, or the linked ticket already holds the answer.** Name the source. This is the common case.

**Check with Aaron before fanning out.** State in three lines what the timeline shows and where it goes quiet, then ask what he already knows (a ticket, a meeting, a person) and what decision hinges on the answer. One question, via AskUserQuestion. He often holds the missing piece, and one question is cheaper than five investigators. Away or no answer: state your assumption and continue.

Fan out (Step 3) only when both hold:

- the timeline and gh leave the question open, or point outward (a ticket key, a Confluence link, a Slack thread, a Sentry issue), and
- the answer changes a decision: a planned change, a TRD, a review verdict.

A curiosity question gets the inline answer with its gaps named.

## Step 3. Investigators, one per source with signal

The evidence sources in this environment. No discovery step; this table is it.

| Category | Source | Reach it with |
|---|---|---|
| Source control | git, GitHub | `git`, `gh` (always available) |
| Tickets | Jira | `mcp__atlassian__searchJiraIssuesUsingJql`, `mcp__atlassian__getJiraIssue` |
| Long-form docs | Confluence | `mcp__atlassian__searchConfluenceUsingCql`, `mcp__atlassian__getConfluencePage` |
| Team chat | Slack | `slack_search_public*` tools when the Slack MCP is connected; otherwise a gap |
| Private record | meeting-notes repo, memory ledger | grep `/Users/CHUAX4/Desktop/coding/meeting-notes/` (private: never quote it outside the reply); claude-mem search |
| Error tracking | Sentry | `mcp__sentry__*` when authenticated; otherwise a gap |
| Observability, product analytics | none | always a gap; say so in Sources Consulted |

Spawn only investigators whose source plausibly holds signal for this target. Sentry only when the code is defensive (retries, guards, timeouts, flags). Slack and Confluence when a commit, PR, or ticket points at a discussion or design doc, or when the paper trail is thin. Launch them in one message so they run in parallel. Each is an Agent with `subagent_type: general-purpose`, told to write nothing, and given:

1. `references/investigator-prompt.md`
2. The matching playbook in `references/sources/` (`linear.md` doubles for Jira, `notion.md` for Confluence, `code-archaeology.md` for git; add `incident-postmortem.md` for defensive code)
3. The Step 2 anchor
4. Aaron's original question

A skipped source goes in Sources Consulted with its reason: no tool, or provably irrelevant.

## Step 4. Synthesize

Two or fewer investigators: synthesize inline. More: one Agent with `references/synthesizer-prompt.md`, `references/epistemics.md`, every finding including nulls and skips, the anchor, and the question.

## Step 5. Present

Keep the confidence language as written. Sections, from the synthesizer prompt: The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted (one line per source, including skipped ones with the reason), Confidence Summary. When the question precedes a change, end with a Preserve / Change / Avoid / Risk set for planning it.

Trace back past the latest commit. The current shape is the accretion of earlier decisions.

## Reference files

- `references/epistemics.md`: confidence tiers and phrasing.
- `references/investigator-prompt.md`: base prompt for investigators.
- `references/sources/*.md`: one playbook per source category, plus `incident-postmortem.md`.
- `references/synthesizer-prompt.md`: synthesizer prompt and output format.
