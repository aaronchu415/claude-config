# Agent directives

## Pre-work

- **Step 0.** Before a structural refactor of a file over 300 lines, first strip dead props, unused exports and imports, and debug logs, and commit that cleanup on its own.
- **Phases.** Multi-file refactors run in phases of at most 5 files. Finish a phase, run its check, then wait for my explicit go before the next.
- **Define done first.** Before non-trivial work, state up front the runnable check that proves it: a test, a command, or behaviour exercised on the real changed path (types compiling, mocks, or confidence do not count). Iterate against it autonomously; on failure, diagnose and retry. Escalate instead of guessing when no objective check exists, when passing needs a decision or an irreversible or outward-facing action, or when retries hit the same failure with no progress.

## Code

- **Lazy ladder.** Before writing any code, stop at the first rung that holds; two rungs work, take the higher:
  1. Does it need to exist? Speculative need: skip it and say so in one line.
  2. The standard library does it.
  3. A native platform feature covers it: `<input type="date">` over a picker, CSS over JS, a DB or vendor-platform constraint over app code.
  4. An installed dependency does it. A new dependency is never worth a few lines.
  5. It fits in one line.
  6. The minimum code that works.
- **Lazy rules.** Only requested abstractions (no one-implementation interface, one-product factory, or config for a constant). No scaffolding for later. Deletion over addition, boring over clever, fewest files, shortest working diff. Declarative over imperative (`map`/`filter`/`reduce`, data tables over branching, CSS/SQL/JSX describing the target state) when it is genuinely clearer. Between two same-size stdlib options, take the one correct on edge cases. A deliberate shortcut names its ceiling and upgrade path in the PR description, not inline ([STYLE]).
- **Proactivity.** Fix what a perfectionist senior reviewer would reject. Removing complexity (dead code, duplicated state, inconsistent patterns): fix it without asking. Adding unrequested complexity (an abstraction, layer, dependency, config): ship the minimal version and question the rest in the same reply: "Did X; Y covers it. Need full X? Say so."
- **Never lazy about** input validation at trust boundaries, error handling that prevents data loss, security, accessibility basics, anything I asked to keep. Non-trivial logic (a branch, loop, parser, money or security path) leaves one runnable check behind: the smallest thing that fails if the logic breaks. Trivial one-liners need none. Quality bar for tests: [TESTING].

## Context and edits

- **Swarm.** A task touching more than 5 independent files fans out to parallel sub-agents, 5 to 8 files each.
- **Thin results.** A search or command returning suspiciously few results is re-run narrower (single directory, stricter glob), and you say when you suspect truncation.
- **Renames are grep, not AST.** When changing a function, type, or variable, search separately for: direct references; type-level references (interfaces, generics); string literals; dynamic imports and `require()`; re-exports and barrel entries; tests and mocks. Done means every list is checked.

## Shipping

- **Jira key** (the two work repos only): branch `KEY-1234-Short-Hyphenated-Description`, commit and PR title `fix(KEY-1234): ...`, PR body references the ticket. `hooks/git-guard.sh` knows the real prefix and blocks all of these except the PR body; ask for an unknown number rather than invent one.
- **Before `gh pr create`** anywhere: run the `no-comments` skill on the branch diff.

## Communication

- **Output.** Code first, then at most three short lines: what was skipped and when to add it. A fact or status question gets the fact and its consequence, nothing else. Explanation I asked for (a report, walkthrough, per-phase notes) is given in full.
- **Fog test** for a plan's deferred section: a question that can be stated precisely now goes in the plan as an open decision, even if unanswerable today. Only what cannot yet be phrased sharply is deferred, as an area to revisit, never pre-sliced into invented tasks. Applies to ce-plan's deferred notes and any "later" section.
