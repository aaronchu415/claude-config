---
name: pr-walkthrough
description: >-
  Walk a senior reviewer through someone else's PR so they can sign off on it
  with understanding, not just a bug list. Use when handed a PR number or link
  by another author and asked to review it, walk through it, explain what
  changed, say what to look at, or draft review comments. Produces the guide
  first (intent, the world it lands in, before/after, trunks, changed
  assumptions, critical lines), findings only when asked, comments in the
  reviewer's own voice and only posted on an explicit go. Self-review of our
  own branch keeps using /code-review.
---

# pr-walkthrough

The reviewer signs off on this PR and owns the consequences. A list of bugs in code they have not read is noise they cannot judge. The job is to make the PR understandable first. Findings come second, and only when asked. Comments come last, in the reviewer's voice, and never land on GitHub without a go.

Three rules outrank everything below.

**Nothing is posted, resolved, or replied to on the PR without an explicit yes for that exact text.** Discuss in the session first.

**The guide names lines, never reprints them.** The diff is already on GitHub. Cite `file:line` and spend words on what the diff cannot show: why, what changed underneath, who else relied on it.

**Every claim about code or a vendor is checked against source, never recalled.** Read the file. Read the library in `node_modules`. Read the vendor doc. Say which rung of proof each safety fact reached (see `blast-radius`).

## Sizing

Count the files and trunks before writing anything.

| Shape | Output |
| --- | --- |
| Under 4 files, one trunk | One screen: intent, before/after, critical lines, changed assumptions. Skip the trunk map. |
| One trunk, many files | Full guide, one trunk. Lean on the meaty/mechanical/skip split. |
| Several trunks | Full guide. Trunks first, then everything else per trunk. |

A dependency bump, a docs change, or a generated diff gets two sentences and a skip list.

## Step 0: Scope the PR

```bash
gh pr view <n> --json title,body,author,baseRefName,headRefName,headRefOid,additions,deletions,changedFiles,commits
gh pr diff <n>
git fetch origin <headRefName>
git diff origin/<baseRefName>...origin/<headRefName> --stat
```

Read full files from the PR's head with `git show "${SHA}:path"` (braces, because zsh mangles `$SHA:path`). Leave the working tree alone. Read the ticket when the title carries a key.

The three-dot diff is the source of truth for what changed. The PR body is a claim about it.

## Step 0b: Calibrate, three questions at most

Before writing the guide, one round of questions so it is sized to this reviewer, not to a stranger. Use the question tool, one round, then proceed on the answers.

1. For each area the PR touches (a subsystem, a file cluster, an external vendor), offer two options: **Explain it** or **Skip it, I know this**. Fold small areas together so the round stays under three questions.
2. One open question: any caps, limits, product rules, or recent decisions in this area that the code does not show. Examples of what has mattered before: how many line items an order can hold, whether a vendor field is one slot or a list, which environments already have a config value.

This is not a test. The reviewer already knows what they do not know and will say so when asked plainly. Facts gathered here feed Step 8 so findings are never built on a premise the reviewer would have corrected.

Skipped areas get one line in the guide, not a section. Facts given here are quoted where they change a finding.

## Step 1: Intent

One paragraph: what the author set out to do and why, built from the ticket, the PR body, the commit messages, and the code. Ask the reviewer if these disagree and the code does not settle it.

Then list what the diff does that the description does not mention. A vendor call swapped for a different one, a new dependency, a config edit, a refactor that came along. Each gets one line and the file. This list is often the most useful thing in the guide.

## Step 2: The world it lands in

For each core file the PR changes: what it does today, in three to five sentences a stranger can follow. Name the shape when it has one: "the handler above line 405 retries on throw, everything below is best-effort". Name the entry points that reach it.

For each external system the PR talks to: the five-line mental model a reviewer needs before any finding about it makes sense. What the unit of data is, what is overwritten versus appended, what fires on the other side, who owns the other side. Source it from the vendor's docs or the SDK in `node_modules`, and link the page.

This section exists because a finding like "attribute X is overwritten per order" means nothing until the reader knows an attribute is a single slot on a profile.

## Step 3: Before and after

Prose first: what a user or a downstream system experienced before, and what they get after.

Then Gherkin, one scenario per behaviour that changed. Use real numbers and real SKUs where they make the change concrete. Two scenarios that differ only in a number beat one abstract scenario.

## Step 4: Trunks

A trunk is one decision that spawned a set of related edits. Derive trunks from the diff, never from the file list. Grouping signals: shared root cause, same subsystem, same user-facing failure, overlapping fix path, one edit forcing the next. One logical change scattered across many files is one trunk; one file edited for two reasons is two.

Per trunk:

```
### Trunk N: <short name>
Goal: <the intent, one line>
Mechanism: <how, one or two lines>
Risk: low | medium | high, and the one reason

| Read | File | What changed |
| 1 | path:lines | core logic |
| 2 | path | tests that pin it |
```

Order files as a reader should read them: the decision first, then what follows from it, tests last.

After the trunks, sort every changed file into exactly one bucket:

- **Meaty.** A decision lives here. Logic, a contract, a schema, money, a retry, a vendor payload. The reviewer reads these.
- **Mechanical.** Follows from a meaty change with no decision of its own: renames, moves, wiring, fixtures, generated output, tests that mirror the logic. The reviewer skims these.
- **Skip.** Cosmetic, unrelated, or pre-existing. The test for pre-existing: the same issue would be flagged on an identical diff that did not touch this file. Name the reason per file.

## Step 5: Assumptions that changed

The reviewer's own words for what they want most: "assumptions that changed". Inventory them, no attack needed.

For each: what the code assumed before, what it assumes now, the `file:line` where the new assumption is made, who else relied on the old one (grep the callers and readers), and how far the check got (pointed at the line, showed the bad case cannot happen, ran it).

Classes to walk through so nothing is missed:

- **Cardinality.** One became many. `items[0]` became a loop. One event became N events.
- **Data shape.** A field moved, a type widened, a required field became optional.
- **Value range.** A cap, a default, a unit.
- **Ordering and timing.** What runs first, what happens on redelivery, what happens if the last run died halfway.
- **External contract.** What the vendor receives, what it does with it, what fires on its side.
- **Config and environment parity.** A value that must also exist in another environment.
- **Product intent.** A rule the code now enforces that a person on another team decided.

An assumption whose old form still has a reader somewhere in the repo is a finding. Put it in Step 8, and say so here in one line.

## Step 6: Critical lines

At most ten `file:line` entries. Each gets one sentence: what a reader must understand here, and what a customer or downstream system sees if it is wrong. These are the lines the reviewer should be able to explain back.

## Step 7: Stop and hand over

Deliver Steps 1 through 6, sized by the Step 0b answers, and end the turn. Findings wait. The reviewer will ask questions, push back with domain facts the diff does not carry, and say when they want the bugs.

Answer follow-ups in plain words. When an answer depends on a fact only the reviewer or the author knows (how many SKUs an order can hold, whether marketing wants the field), ask for it rather than assuming.

## Step 8: Findings, when asked

Mechanics for finding bugs live elsewhere. Run `/code-review` on the PR, `blast-radius` when shared code, a schema, a wire format, or a dependency moved, and `test-designer` when tests are most of the diff. Give one finder the framework-native charge: what does the platform already provide that makes this diff smaller. Give another the removed-behaviour charge: every deleted or replaced line, and who still depended on what it did. Load `aaron-review` as the lens.

Filter before presenting:

- Drop pre-existing issues, coverage padding, defensive nits, and anything the reviewer would not block on.
- A finding that rests on a domain fact gets the fact checked with the reviewer first. Half of a finding died on "there are only three or four SKUs".
- A finding that rests on vendor behaviour gets the vendor doc or SDK source linked.

Present one finding at a time, in this shape, then ask keep, drop, or dig:

```
Finding N of M

What is wrong: one sentence a customer would understand, no identifiers.
Logic path: file:line, then file:line, with the value at each step. Real numbers.
Fix: the smallest change, as code they can paste.
If left as-is: the concrete thing that happens in production.
Verified: what was run or read; what was not.
```

Consequence first, mechanism second. Gloss an identifier the first time it appears. If an earlier answer already settled a finding, say so in one line and skip its block.

## Step 9: Comments in the reviewer's voice

Draft only what the reviewer kept. Voice rules and verbatim examples: `references/voice.md`. Posting mechanics, anchors, and edits: `references/posting.md`.

Read the draft back in the session. Post only the exact text that got a yes.

## The bar

The guide passed if the reviewer can answer, for any changed value, "where does this come from" and "what can change it" without opening the diff. It failed if it restates the diff, hides the point behind an identifier, or offers a bug the reviewer has no context to judge.

Short by leaving things out. Every section that would say nothing for this PR is omitted, not filled.
