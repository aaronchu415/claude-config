---
name: blast-radius
description: >-
  What a change breaks somewhere else, beyond the diff, with the one fact it
  is safe because of proven by running real code. Use when reviewing a diff
  that touches shared code, a schema or wire format (zod, a vendor SDK, a CMS,
  a service contract), a dependency version, or a feature flag, and when
  asked "what could this break". Docs-only and test-only diffs skip it.
---

# blast-radius

Listing the callers is not the job; grep does that in a second. The job is the breakage grep will not show.

## Do not trust your own writeup

A writeup that sounds right reads as convincing whether or not it is true. Find the one or two facts the change's safety depends on and prove them by running code.

For each safety fact, get it as far down this list as is cheap, and say where it stopped:

1. You said so. Worthless alone.
2. You pointed at the line: a real `file:line`, or the library's own source.
3. You showed the bad case cannot happen, step by step.
4. You ran it: a script or test that calls the real code and fails loud if you are wrong.
5. You reproduced it in the running app.

A fact that does not reach step 4 is written up as unproven, never as settled. Step 4 is usually one small script that imports the library the app ships and calls the exact function in question.

## Steps

1. **Read the change.** The diff, the symbols it adds, changes, deletes, and what it now does differently, including what the diff does not spell out. Pull the PR and commits with `why` Step 2.
2. **Find the one fact it is safe because of.** Most risky-looking changes are safe because of a single fact ("this call only drops already-dead cache entries"). Find it. Spend time here, not on a list of maybes.
3. **Look where grep stops.** The library's source at its pinned version and any local patch. When things run: microtasks, unmount and teardown, server versus client. What a symbol search misses: the JSON an API returns, a DB column, a wire format, a CMS or vendor field another repo reads, a feature flag, code three hops downstream, the second region running the same timer.
4. **Weigh each risk honestly.** A real chance of happening and a real cost. Confirmed risks in one list, checked-and-cleared in another. Cite a real `file:line`; a search that finds nothing is still an answer; never invent a caller or an API.
5. **Prove the one fact.** Write the script or test, run it, paste what happened. Cannot prove it cheaply: mark it unproven.
6. **Wide change:** one Agent per consumer surface (web, functions, CMS, partner feeds), same question, merge the answers.

## Hand back

- **What it does.** Including the part that is not obvious.
- **The one fact it is safe because of.** Which step it reached, and the proof, or "unproven".
- **Risks.** Only real ones: how it breaks, `file:line`, likelihood, cost, how to check, proof for the ones that matter.
- **Cleared.** What you checked and why it is fine.
- **Before merge.** The cheapest test or repro that catches the real bug, including the script you wrote.

Run the writeup through `unslop`, cite real code, strip anything private before it leaves the reply.
