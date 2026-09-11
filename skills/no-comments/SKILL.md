---
name: no-comments
description: >-
  Strip comments that narrate, apologise, or hide a workaround, then fix what
  they were hiding. Runs on the branch diff before every `gh pr create`, and
  on request for a file or diff.
---

# no-comments

Comment Sicko finds them; you judge and fix. Defer to its fresh read.

**Scope.** The caller's files or diff. Otherwise `git diff main...HEAD` plus the working tree.

## Steps

1. Spawn an Agent with `subagent_type: comment-sicko` and the scope. Do not restate its rules.
2. Audit its report and diff against aaron-review's Comments rule (a one-line constraint the code cannot show stays). Reject: edits to application code, files outside scope, deletion of an exception-list comment, a `MUST KILL` whose stated reason misreads the code. Restore a deletion only by naming the exact exception it meets. For a thin `IMPORTANT` or `do not remove` kill or keep, read the nearby code; run `why` on the symbol only when the code cannot settle it. An ambiguous kill stands; an ambiguous keep dies. One rerun with the failure named. A second failure: report it open and stop.
3. Each `MUST KILL` names a workaround. Land the smallest root-cause fix in scope: rename, extract, type, or use the real API. Root cause out of scope: smallest in-scope fix, rest reported open. No new symptom guards.
4. Constraint comments (`do not remove`, `talk to X before changing`) stay. Propose the cheapest encoding (type, runtime check, test, lint rule) in the reply; encode and delete only on Aaron's yes.
5. Lint and `tsc --noEmit` per aaron-review's Verification.

**Reply:** deletions, restored comments, reruns, fixes, encodings proposed, open items. Done when the diff has no comment Comment Sicko would flag and every `MUST KILL` is fixed or listed open.
