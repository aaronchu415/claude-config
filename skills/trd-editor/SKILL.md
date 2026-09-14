---
name: trd-editor
description: Aaron's style of TRD or design doc. Use when drafting one, when asked to fix or polish a TRD or make it readable for a PM, or when publishing or reviewing one on a wiki page.
---

# trd-editor

A TRD is a story told to a first-time reader who has to make a decision. Everything below is one of three ideas applied.

**Order the sections by what the reader wants to know next.** §1.

**Every fact lives at the altitude of the person who acts on it.** Body for the decider, appendix for the builder. "Too technical" means move it down, never cut it. §3.

**Say it the way you would at a whiteboard.** Plain, stated rather than argued, nothing about the document itself. Name things by what they do. §2.

## Start here

| What you are doing, or what Aaron said | Section |
| --- | --- |
| Drafting from scratch | [§1 Flow](#1-the-flow-of-the-story) |
| Deciding what goes in the body vs the appendix | [§3 Detail](#3-the-level-of-detail) |
| Editing an existing draft | [§4 Passes](#4-doing-a-pass-on-a-draft) |
| Finished a pass and want a second opinion | [§5 Gauge](#5-the-gauge) |
| "sounds weird" | [§2 Language](#2-the-language) |
| "this is too much" | [§3 Detail](#3-the-level-of-detail) |
| "very hard to follow" | [§3 Detail](#3-the-level-of-detail), then [§1 Flow](#1-the-flow-of-the-story) |
| "too technical, it will lose the humans" | [§3 Detail](#3-the-level-of-detail) |

Drafting from scratch: offer `/grill-me` in one line so the design branches get settled before the first version exists. Offer only. Aaron starts it.

## Local references

Three files sit next to this one and are not committed, because each holds verbatim internal material.

- `references/before-after.md`: verbatim OLD to NEW pairs, one per lesson, A to T. Open it before rewriting a draft that drew a complaint, and before drafting a body a PM will read. Matching the NEW side is the job.
- `references/calibration.md`: the gauge numbers from real docs, so §5's bands have evidence behind them.
- `references/confluence-publishing.md`: open only when moving a doc onto a wiki page, editing it there, or when asked to "review the TRD" on the live page.

## 1. The flow of the story

**The order of sections is the order of questions a first-time reader asks.** A smaller doc collapses steps, but the order holds. Each section answers exactly one question.

| The reader asks | What answers it |
|---|---|
| Why are we here? | Background, in time order: the gap, the first thing that needs it, the questions that were set |
| What is in, what is out? | Scope lines in the header, a related-documents table pointing at who owns the rest |
| What words do I need? | A terms table, only words that carry weight later; or defined inline the first time they do |
| What will exist when we are done? | The platform's answer to the questions that were set, stated; one picture |
| What shapes the design? | The constraints, each a bold phrase and a plain sentence with its consequence |
| How does it work? | The pieces and their connection points, then one instance walked through in time |
| What can go wrong? | Edge cases, each with a cheap mitigation |
| What is settled, what is open? | Open questions with a best guess and an owner; a decision register at programme scale |
| What are the pieces of work? | Tickets, their order, one paragraph of estimate |
| Where is the detail? | The appendix, marked skippable, every anchor and payload the builder needs |

**Default skeleton** for any doc a PM and an engineer both read:

```
Header                 audience row says which sections are whose
1 Background           the gap, the first case that needs this, the spike questions
2 Terms                six rows, no more
3 What the platform already gives us    the spike answers, one bold phrase each
4 The pieces, and what changes in each  one map · one piece/today/after table · one subsection per piece
5 One instance, start to finish         a timeline table, then each row as a beat in prose
6 What changes, at a glance             behaviour rows a reviewer can tick
7 What can go wrong
8 Open questions                        best guess + owner
9 Units of work                         tickets, order, estimate
Appendix A             path:line table, design detail, interface diagrams, request bodies,
                       platform reference, config payloads, scenarios; numbered A.1…
```

### Devices that carry the flow

**Pieces and connection points, not a file list.** A handful of boxes and the arrows between them: one map with the boxes lettered, one piece / today / after table, then a subsection per piece. A reader who cannot read code can hold six boxes in their head. They cannot hold a table of file paths.

**Before to after is the unit of explanation.** Every change is a pair: two trees for a data model, two arrow diagrams for a flow, two wireframes for anything the customer sees, "**Today.**" then "**After.**" in prose. The pair replaces the table of file paths, and it is where `EXISTS` / `NEW` / `UNCHANGED` live. Two pictures beat one annotated picture: side by side when they fit the width, stacked under two bold headings when they do not.

**Walk one instance through time.** A timeline table, rows are events, columns are each piece's state, with a before | after split on the one that changes. That table is the whole design in five rows. Then write each row as a beat: what arrives, what happens today, what happens after, with real-looking values. The request bodies go in the appendix under the same beat numbers.

**Scenarios in Gherkin, three parts, in the appendix.** Today: one Feature, every step read from the code and cited. What changes: the same scenario names, each retired step struck through with its replacement beneath. New: a second Feature for cases that did not exist. The body carries the same thing as a today | after behaviour table with a one-line pointer.

**Options: recommend, then justify, then dismiss.** Name the alternatives, bridge with "Why it matters to us", then the table. Recommended first with a two-sentence why, fallback second, rejected last and short: "Table storage was chosen over Redis because it is durable, already provisioned, and costs pennies."

**A constraint always carries its consequence.** "Two properties of this server shape the whole design", then each as its own paragraph with what follows from it, and the reason in the same breath: "It cannot hang off the order, because each record holds one set of custom fields and the order's is already spoken for."

**A requirements table gets a "Where" column** pointing at the section that satisfies each row, when the reader is an engineer checking a contract.

**A one-line reading map is allowed only when it carries the order's logic.** "The design unfolds in three beats, in the order a page comes to life." Never a sentence about why the document exists.

**Prior art is one paragraph of grounding, then start with us.**

**The header block** carries epic, status, owner, dates, scope, related documents, and an **Audience** row naming the job (a requirements contract, a design proposal, a programme map) and which sections are whose.

### Contract scale

A partner API spec is a different shape, and shorter, because the reader is the engineer on either side of the wire. Purpose in two sentences. A numbered "the integration must support" list. One architecture picture with a numbered flow. Then one block per endpoint in the same shape: method and path, headers, request body with inline comments, a response-code table with a Meaning column that says what a code does *not* mean, sample bodies. A status vocabulary table. Threats, then controls, then the ask back to the partner. "Needed from <partner>" as a labelled block where the need arises. Open questions live inside the section they belong to. Scope negatives go where the reader would otherwise assume.

## 2. The language

It should sound like Aaron said it at a whiteboard to a colleague.

**Name things by function in the body, by identifier in the appendix.** "The order-creation function", "the shipment-update webhook", "the consignment reference". The identifier appears in the appendix beside the same sentence. A reader hears the function name in meetings and never hears the file name. Keep vocabulary the reader will hear from partners (document numbers, partner status codes) with a one-line gloss. Drop a technology's vocabulary the moment that technology is out of scope.

### The five tells that make a draft sound weird

Every one of these was rejected verbatim. Delete on sight.

**Meta-narration.** A sentence whose subject is the document: "Why this document exists", "provides a comprehensive overview", "the single most important idea in this document". Say the thing instead.

**Ranking facts for the reader.** "the largest single external risk", "load-bearing", "the one to watch", "worth reading twice". Replace the ranking with the fact: "Blocks workstream C", "nothing in our code can catch it", "`99` needs watching".

**Rhetorical setup.** "This is not a preference; it is the reason...", "The honest position is worse than 'unanswered'", "The concept is elegantly simple". Open with the mechanism.

**Clever compressions.** "The happy path depends on the unhappy path existing." Spell out the mechanism and end on the fork: "Either item-level refunds move into scope, or the capture decision has to change."

**Draft archaeology.** "The earlier draft assumed...", "this is now answered", "no longer", "withdrawn". The reader has never seen the earlier draft. State only what is true now.

Also cut: a Summary section, "best of both worlds", "it's worth noting", and textbook numbers presented as ours when nothing was measured.

### How the good sentences are built

**A paragraph opens with a bold phrase that is the claim**, then plain sentences carry it: "**Nothing is pushed, in either direction.** Everything we want to know, we have to ask for."

**Status words open a subsection and stand alone.** "**Settled.**" "**Open. Decision needed before launch.**" "**Today.**" "**After.**"

**Cause then effect, in time order.** "The vendor's order folder is read-only for us. We cannot delete or move files after processing them, so the folder listing always contains the full history. The function must keep its own record."

**State the consequence, not the reassurance.** "Noisy in the logs, but no double shipment."

**An open item ends with an owner and an action.** "**Answer this before we build. Owner: Finance and Procurement.**" `[FILL]` is fine for an unknown owner or date.

**Cross-reference by section number.** "See section 4.4." "See A.5."

**Uncertainty is structural, not adverbial.** A Known | Source table and an unknowns list, not the word "probably". "The values here are what we expect, not what we have seen."

**A section may close on one guiding line that compresses it.** "The bridge is convenience; the broker is the boundary."

### Words

**Teams, never people.** Engineering, Product, Finance, Operations, Customer Service, Marketing, Legal, Leadership, Corp IT. Only the byline carries a name. Refer to sibling docs by title, never "Dana's TRD".

**No blame.** State the dependency, not the partner being late.

**Define a load-bearing term inline the first time it appears.** "the **material master**: the central product record every internal system reads from."

**Kill shorthand that has no life outside the doc.** "give-up horizon" becomes "tells our poller when to stop waiting and raise an alert".

**Headings in the reader's vocabulary.**

**Strikethrough carries meaning in exactly two places:** descoped items and retired Gherkin steps. Inside a live section it is not an argument.

General prose rules (restraint, no reassurance tails, no summary closers, round numbers) are in the `unslop` skill and apply here too.

## 3. The level of detail

**One doc serves two readers by putting them at different depths, not by picking one.**

**The body is the decider's altitude:** Product, an Eng Manager, Leadership, the engineer reading it for the first time. What each piece does, what changes in it, why, what we need from whom, what can go wrong, what it costs. The test for a body sentence is whether the decider can do something with it. A file path, a schema field, a JSON body: no. Give one concrete anchor per claim, in a form the decider can use: an exact partner value, a screenshot, a real-looking order number and tracking number in the walk-through.

**The appendix is the builder's altitude.** Every `path:line`, the schema, the retry ladder with timings, the handshake, the request and response bodies for each beat, the config payload per environment, the platform reference verified against a pinned SDK version, the Gherkin scenarios. Mechanism plus reason, with a worked example beside each schema. Numbered `A.1…` and cross-referenced from the body by that number. It carries the same facts the body tells in words, and a builder can read it without the body.

**When the reader is the builder** (an engineers-only doc: an ingestion pipeline, a rendering architecture), the appendix collapses into the body and identifier density runs high. Still name by function first and give the identifier second.

**Either way:** an option's justification is two sentences; one high-level table beats three detailed ones; a requested expansion is one round away from being halved ("no this is too much"); estimates stay out unless asked, and land as one paragraph; tutorial material is not the doc. Define the two or three terms the reader needs where they are needed, link the rest, and start with us.

### Tables, prose, pictures

**Use a table** when it compares options across rows, tracks status and owner, lists facts about an external system, is a checklist, or is a timeline of one instance.

**Use prose** when explaining a situation. "What we have right now, what needs to change to support X, and what the issues are" is three paragraphs, not a three-row table of paragraphs.

**Pictures are ASCII by default**, because Aaron edits them inline. A rendered image is fine for one he will not edit as text. Conventions: a swimlane per party, one vertical spine, numbered steps that match a numbered list in the prose, storage in double lines, failures in a separate panel, `EXISTS` / `NEW` / `UNCHANGED` on every box, and the consequence stated inside the box.

**Every arrow names a mechanism.** "mismatches → Finance" with no format, no trigger and no owner is a shrug in ASCII. Name the artifact or cut the arrow.

## 4. Doing a pass on a draft

Three passes, in this order, because altitude decides what is left to reorder, and order decides what is left to reword.

**1. Altitude.** Decide who the reader is. Move, do not cut: everything the decider cannot act on goes to the appendix under a numbered heading, and the body keeps a one-line pointer. Rename by function as it moves. Done when every cross-reference points at the new numbering and the old section numbers are gone.

**2. Flow.** Reorder to the reader's questions in §1. Build the map, the piece table, the before/after pairs, and the timeline. Letters, numbers and cross-references move together: an A-to-F table against an A-to-G body puts every later reference off by one.

**3. Voice.** Sentence level, per §2. Fix the family, not the instance: Aaron points at the one he happened to land on, so one "largest risk" means grep for every ranked fact in the document.

Then run the gauge.

## 5. The gauge

**A smoke detector for all three passes, not a score.**

```
python3 ~/.claude/skills/trd-editor/gauge.py docs/<file>.md
```

| Column | Measures | What good looks like |
|---|---|---|
| `tutorial%` | Flow. Share of words in H2 sections that hardly mention us or our partners. | 0 to 5. Anything near 50 is a primer wearing a TRD's clothes |
| `narrating_headings` | Flow. Headings about the document itself. | 0 |
| `summary_section` | Flow. A Summary or Conclusion heading exists. | 0 |
| `dangling_refs` | Flow. `§N` references to sections that do not exist. | 0 |
| `body_ident/k` | Detail. Backticked identifiers per 1000 words outside the appendix. | Under 15 for a mixed audience. 25 to 60 for an engineers-only doc |
| `code%` | Detail. Share of lines inside code fences, doc-wide. Before/after pictures and appendix payloads both count. | 40 is fine with a full appendix. Count the body alone if it matters, and expect under 25 |
| `anchors` | Detail. `path:line` references and pinned permalinks, doc-wide. | No target. High is right for a builder's doc, near zero for a decider's |
| `avg_sent`, `sent>30%` | Language. Only flags extremes. | Around 16 words, under 10% long |
| `tier1` | Language. Phrases Aaron rejected verbatim. | 0, or the Superseded heading |
| `tier2` | Language. Phrases inferred from the same moves. His call. | 0 |
| `names` | People named outside the byline. | 0 |
| `owners`, `fills` | Open items carrying an owner; `[FILL]`/TBD left to resolve. | Every open item has an owner |

Per-document numbers behind those bands: `references/calibration.md`.

**The one case to remember.** A doc where every flow and language column was already clean, and `body_ident/k` alone said the code was still sitting in the story. The facts were identical at 50 ("very hard to follow") and at 7 ("a ton better"). Nothing was cut. It moved.

**Tier 1 phrases are verbatim rejections. Tier 2 is inference** from the same three moves: the document describing itself, the writer's opinion standing in front of the fact, and a throat-clear before the fact. If Aaron reads a tier 2 phrase and it still seems fine, remove it from `TIER2` in `gauge.py`. "This document covers X only" is a scope line and is never flagged.

**The gauge needs a local word list.** `gauge.py` reads `gauge.local.json` next to it for the two patterns that cannot be generic: `we`, the words that mean "this is about us" (the company, its products, its vendors), and `names`, the colleagues whose names must not appear outside a byline. Both fall back to a harmless default when the file is absent, so the script runs anywhere. That file is not committed.
