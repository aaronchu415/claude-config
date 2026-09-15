---
name: aaron-review
description: >-
  Aaron's code-quality lens. Use when writing or refactoring code, reviewing
  someone's diff, or judging a test suite; /code-review and review-loop supply
  the mechanics, test-designer supplies the test lens, and Vercel's vendored
  skills supply the React/Next rules.
---

# aaron-review

Base rules are in `~/.claude/CLAUDE.md`. This file is the judgment calls those rules cannot make. To actually run a review, see `/code-review`.

Two rules outrank everything below.

**Legibility wins.** If a rule here would make the code harder for a stranger to follow, the stranger wins.

**Solve problems one level higher.** A guard clause hiding a bad state, a retry masking a race, a null check papering over a wrong contract: all three treat a symptom. Go fix where the bad state is born instead. If that is out of reach (another team, another repo, a vendor), say so out loud, name the real fix, and flag the symptom fix as a deliberate choice.

## Start here

| What you are doing | Section |
| --- | --- |
| About to write new code | [Before you write](#before-you-write) |
| Naming something, or picking which file it goes in | [Legibility](#legibility) |
| Splitting a file or component | [Structure](#structure) |
| Writing React or Next.js | [React and state](#react-and-state) |
| Designing a type, or reading data from outside | [Types](#types) |
| Writing or judging tests | [Tests](#tests) |
| "This function feels hard to follow" | [Measure, do not argue](#measure-do-not-argue) |
| Touching code that talks to an external system | [Integration code](#integration-code) |
| Leaving feedback on someone else's diff | [Review-comment voice](#review-comment-voice) |
| Finishing a pass | [Verification](#verification) |

## Before you write

These add to the lazy ladder in `~/.claude/CLAUDE.md`.

**Judge native platform features without repo precedent.** The usual way to answer "do we already have something for this?" is to grep the repo. That structurally misses platform features nobody has used yet: `<input type="date">` returns zero hits precisely because no one reached for it. So ask whether the browser, CSS, the database, or the platform you are already on does the thing, even with no existing usage to point at.

**Parity gate: go native only when native does everything.** Swapping a camera modal for a file input is less code, but it loses the in-page camera. When the native option drops something the user actually asked for, do not just swap it. Suggest it, name exactly what would be lost, and let Aaron decide.

**An installed dependency is judged on fit, not on "we already use it".** A package being in `package.json` is not a reason to reach for it. If it does not fit the problem, hand-rolling the small thing is correct.

**A new dependency needs a yes before it lands.** A popular package for a real need is allowed. Lay out the pros and cons and wait for the yes.

## Legibility

The question behind every rule here: **what will the next reader have to stop and ask?** Correctness is table stakes. Names, placement, and signatures are judged on the questions they leave behind.

### Naming

**Parallel things get parallel names.** If two names sit side by side and only one says what it is for, both are wrong. `startDate` next to `end` means fixing both, not one.

**One name per concept.** Pick one word for a thing and never use a synonym. If the code says `user` here and `account` there for the same thing, every reader has to stop and work out whether they are different. They pay that tax forever.

**A name promises no more than the code does.** `getUser()` that also writes to the database is a lie. A noun implying state the thing does not hold is a lie. The test: can a reader trust the name without opening the body? If not, rename it.

**Every parameter is a question you are asking the caller.** `compress(file, quality)` asks "what quality?". If most callers cannot answer that, give it a default. If nobody would ever answer differently, delete it and hardcode the value.

**If a name needs a comment, the name is wrong.** Fix the name and delete the comment.

### Placement

**Cohesion over convenience.** Code goes in a file because it is about that subject, not because that file already had the import you needed. "It was easier to put it here" is how files turn into junk.

**Things that change together live together.** The reason to split is that the parts change at different times for different reasons. Not that "constants go in a config file". If a value and the code using it always change in the same commit, they belong in the same file.

**Locality: put a value right next to the code that uses it.** A magic number used by one function lives in that function's file, not in a `constants.ts` three folders away. Moving it away means the next reader opens a second file to understand the first one. Two things buy that cost back: a second caller genuinely needs it, or it changes on a different schedule than the code (a feature flag, an API URL).

**Package by feature, not layer.** Group folders by what the code is about, not by what kind of code it is. So `checkout/` holds its component, its types, its hooks and its tests. Not `components/`, `types/`, `hooks/` with checkout's pieces scattered across all three. And do not create the folder until there are enough pieces that the folder has an obvious name. A folder created because "we always have a `services/`" is filing, not organizing.

**No junk-drawer modules.** `utils.ts`, `helpers.ts`, `common/`, `shared/`, `misc/` accept anything, so everything goes in, and then nobody can find anything. If a function has no obvious home, that means its subject has not been named yet. `formatMoney` does not belong in `utils`, it belongs in `money.ts`. The fix is a name, not a bucket.

**A file is about one subject, not one function.** Five small date functions in `date.ts` is right. The rule for splitting is "would a reader go looking for this on its own?", not "this file has four exports, time to split".

Vocabulary: Beck *Implementation Patterns* (symmetry, rate of change), Parnas (information hiding), Martin (common closure, common reuse), Page-Jones (connascence), SICP ("programs must be written for people to read").

## Measure, do not argue

**Prefer a check a machine can run over an argument about the code.** Two of them pay for themselves: SonarQube-style cognitive complexity for "is this hard to follow", and Stryker mutation testing for "does this suite actually catch anything". Commands, config and gotchas for both: [references/mechanized-checks.md](references/mechanized-checks.md).

**Score cognitive complexity, not cyclomatic.** Cyclomatic just counts branches, so a flat 13-case switch scores the same as a nested mess. Nesting is what actually stops a human. A flat dispatcher I checked scored cyclomatic 13 and cognitive 2, and it was fine as-is.

**The bands.** 0-8 is fine. 9-15 means read it before touching it. Above 15 the split rule applies. That is Sonar's default gate, not a number invented here.

**Chase nesting, not the total.** In the report only the "incl. N for nesting" entries are worth fixing: one +3 nested block is worth about 5 points and usually one extracted, named function. The lone +1s on `??`, an `&&` chain, an `else`, a `catch` are the price of correct code. Leave them alone.

## Structure

**Split complicated code into pieces a reader takes one at a time.** A helper with exactly one caller still earns its place if the call site reads better: `compressImage.ts`, or a guard named `redirectIfAccessTokenExpired()` instead of the raw check inline.

**One component per file.** If something small has to share the file (an icon, a two-line helper), it goes BELOW the main component. Files get read top to bottom, so the main thing comes first.

**Schemas, types and util functions get their own files.** This one beats "fewest files" on purpose.

**Compute values instead of copying them.** If a number can be derived from data already in the code, derive it. Writing it out by hand creates two places to keep in sync, and the second one gets forgotten.

### Invariants

**Establish an invariant at a boundary, once, and let everything past it trust the rule.** A rule like "every order the fulfilment partner knows about has deliveries" is either enforced at one door or re-checked by every consumer forever. The second shape is the tell: a webhook that creates missing deliveries, a page that handles "no deliveries", a reader that asks "what if". Find the door and refuse there. The bouncer cards at the front so the bartenders do not.

**The door is the earliest point where refusing is cheap.** Earliest, because everything downstream gets to trust it. Cheap, because the door has to be allowed to say no. The commerce platform's API extension is the very front of order creation, but a failure there strands a paid customer with no order. The outbound POST to the partner in the queue handler is one step later, and a failure there is a queue retry nobody notices. Pick the second.

**A door refuses, it does not warn.** Log-and-continue at the boundary is no boundary. Throw, let the error propagate up to the highest handler that can do something useful (the queue's redelivery, the request's 500, the UI's retry state), and catch it there. Catching low to keep going is how an invariant quietly stops being one.

**One door, not two.** Once the boundary holds, a downstream fallback that re-establishes the same rule is dead code that hides boundary bugs. Keep it only for data that predates the door, say so where it lives, and name when it can go.

## React and state

Two Vercel skills carry the React and Next.js rules this file does not repeat. If the repo already vendors them under `.agents/skills/`, read the local copy instead of fetching.

- [react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices): waterfalls, bundle size, server-side performance, client data fetching. Local: `.agents/skills/vercel-react-best-practices/rules-full.md`.
- [web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines): accessibility, focus states, forms, animation, layout. Local: `.agents/skills/web-design-guidelines/`.

On top of those:

**Fewer `useEffect`s.** When a `useEffect` and the state around it start getting complicated, move both into a custom hook. Even if one component is the only user. Put the hook at the top of the file.

**One object beats five `useState`s describing one thing.** If five pieces of state are really fields of one form, make them one object plus a setter that updates a field. Keep lifecycle state (`status`: idle, loading, error) separate from the data itself, because the two change for different reasons.

**`try/catch` with `await`, not `.then()/.catch()` chains.**

## Types

**The type checker is your first test.** Any case the types let you ignore is a runtime failure the compiler could have caught for free.

**Parse data from outside before you trust it.** Request bodies, webhook payloads, third-party API and CMS responses, queue messages, env vars: all unknown until a zod parse at the boundary. Once parsed, trust it. Do not sprinkle `if (!x?.y)` guards through business logic.

**Do not let a type allow a state that cannot exist.** `{ completed: boolean; completedAt?: Date }` permits `completed: true` with no date, which is nonsense, and it compiles. Either derive the boolean from the date, or split it into two shapes: `{ kind: 'open' } | { kind: 'done'; at: Date }`. The tell: if you could write a comment explaining which field combinations are valid, the type is too loose.

**`as`, `!` and `any` are you lying to the compiler.** Each one marks a place where you know something the types do not. Follow it back to where the data entered the system and validate it there instead.

**End a `switch` over a union with a `never` check.** Then adding a new variant breaks the build instead of silently falling through.

**Generate types from the real schema.** `z.infer`, a vendor's generated SDK types, OpenAPI. A hand-written copy of someone else's shape drifts.

**Only tighten a type where the loose one is already costing you.** The signs are a `if (!x) return` you were forced to write, or a `throw new Error('should never happen')`. Both mean the type allows a state that cannot really occur. No such line, nothing to fix.

## Comments

**A comment earns its place by stating a constraint the code cannot show.** "photo is a data URL; the server only wants the base64 part". One line, no JSDoc. A comment narrating what the line below it does reads as AI output, so delete it.

## Never-lazy additions

**Error handling means the user can retry and nothing is silently lost.** The bad version is a network call with no `await` and no `catch`: the promise rejects into nothing, the UI still says "Saved", and what the user typed is gone. The good version catches the failure, puts the screen in an error state with a retry, and keeps the form contents.

**Accessibility never gets dropped to make a refactor land.** Rules: [web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines).

## Tests

The lens is the `test-designer` skill. Load it before writing or judging a suite. The short version: a test earns its place only if its absence would make someone afraid to change the code; a test that is hard to write is telling you something about the design, not about you; use the realest fixture you can cheaply run and never mock internal collaborators; `describe`/`it` names are the spec a stranger reads; and a green suite proves nothing until it has been red for the right reason.

What this file adds:

**Reviewing someone's existing suite means polish, not a rewrite.** Work within the approach they already chose.

**Beck lens.** Do not freeze an accident into a contract. Test pure logic at its own level instead of through the UI. No magic numbers: export the constant and assert against it. Do not try to prove a negative by flushing an arbitrary microtask. And no test-induced design damage, meaning a production API that exists only because the harness needed it.

**Mutation-test the load-bearing files** (money, security and PII, parsers, anything with real branching). Flipping one thing by hand proves that one thing; Stryker proves all of them. The evidence, the three shapes survivors take, and the setup: [references/mechanized-checks.md](references/mechanized-checks.md).

## Integration code

A read-through only judges what is on the page. Integration code fails off the page.

Before calling a module that talks to an external system ship-worthy:

**Check load-bearing SDK assumptions against the installed source in `node_modules`, never from memory of the docs.** Fingerprint and unit formats, lazy vs eager connections, what happens on an undefined property, return types. One agent per SDK is cheap, and doing it found an unbounded string column type and a 256KB message cap that a careful read had missed.

**Check every constant that parameterizes an external system against that system's documented limit.** `MAX_FILE_BYTES = 1MB` read as perfectly reasonable. Against the message broker's documented 256KB cap it was an infinite-retry bug.

**Hunt for what is missing, not just what is wrong.** For every await on an external call, ask "what if this never resolves" (timeouts, keepalives) and "who finds out when this fails every poll" (log levels an alert can key on, terminal states logged distinctly). Code shows you what happens. It never shows you what is absent.

**A reviewer's own mid-review fix is unreviewed code.** If the fix rests on a claim about SDK behaviour, verify the claim first. The word "probably" in the justification is the tell. A round-1 resource-order "fix" traded an inert leak for a live SSH-session leak because "probably lazy" went unchecked.

**Scope the verdict.** "Solid" off a code-read covers logic, tests and style. Say what was not verified: external contracts, failure modes.

**Every mutating step in a timer, queue handler or ingestion loop answers two questions:** what if this runs twice, and what if the last run died halfway? A multi-region deploy runs every timer once per region and queues redeliver, so the code has to land on the same end state either way (a dedupe key, a ledger check, an upsert) rather than assuming a clean start. If the answer is "depends what state was left behind", a reconciliation step is missing.

## Review-comment voice

For feedback on someone else's diff.

**Only flag real gaps in the code this diff changed.** Pre-existing problems, coverage padding and defensive nits get dropped.

**Write like a person.** One sentence with the plain point, then a code example they can paste, then one line on why it matters. Cite the line ("this decision sits three levels deep, extract it"). No metrics, no P1/P2 labels, no "Review summary" or "Nice work overall" blocks. If there is an overall comment at all, one casual sentence.

**"Nothing to flag" is a valid review.** It beats manufacturing findings.

**Name the risky parts and the assumptions the diff makes about things outside the code,** so human attention lands where automation cannot reach.

## Verification

Every pass ends with lint and `tsc --noEmit`, plus the test suite when logic changed. In a monorepo, lint the affected package rather than the root: `pnpm -F <package> lint`.

Before `gh pr create`, the `no-comments` skill runs on the branch diff. A diff touching shared code, a schema, or a dependency version also gets `blast-radius`.
