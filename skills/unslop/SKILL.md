---
name: unslop
description: AI-writing tells to cut. Apply to every piece of prose written or edited, including docs, PR bodies, commit messages, and chat replies.
---

# Unslop

1. Scan for every tell below.
2. Rewrite, keeping the meaning and the intended tone.
3. Ask "what still reads as obviously AI generated?" and fix that too. Done when a re-scan finds nothing.

Rule numbers are stable ids that other skills cite; a removed rule leaves a gap.

## Content

3. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". Delete or expand with real sources.
5. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete.

## Language

7. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. Replace with plain words.
8. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". Write "is" or "has".
9. **"Not just X, but Y."** State the point directly.
10. **Rule of three.** Use the natural number of items.
11. **Synonym cycling.** Protagonist, main character, central figure, hero in one paragraph. Pick one, repeat it.
12. **False ranges.** "from X to Y" where X and Y are not on a scale. List the topics.

## Style

13. **Em dashes.** None. A period or comma in their place; parentheses, en dashes, and hyphens-as-dash are not substitutes.
14. **Colons.** Only before a list or example. A mid-sentence colon connector ("If you're coming from traditional automation: instead of...") becomes its own plain sentence.
15. **Boldface.** Bold carries a claim, not every proper noun or acronym.
16. **Inline-header lists.** A bold label and colon that restates the line ("**Performance:** Performance improved...") becomes prose. A bold lead-in ending in a period, naming the item, followed by new detail ("**Schema in TypeScript.** Tables live in one file.") is fine.
17. **Title Case Headings.** Sentence case.
18. **Decorative emojis** in headings and bullets. Remove.
19. **Curly quotes.** Straight quotes.

## Communication artifacts

20. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" Remove.
22. **Sycophantic tone.** "Great question! You're absolutely right!" Respond directly.

## Filler

23. **Filler phrases.** "In order to" becomes "To". "Due to the fact that" becomes "Because". "It is important to note that" is deleted.
24. **Excessive hedging.** "could potentially possibly be argued that it might" becomes "may".
25. **Generic conclusions.** "The future looks bright." State specific plans or facts.

## Jargon

26. **Abstract metaphor nouns.** Substrate, wedge, vector, locus, vantage, nexus, primitive (as noun), harness (as metaphor), surface (as in "API surface"), bedrock, scaffolding (as metaphor), modality, paradigm, gold-plating, ratchet (as metaphor), evacuate (for moving code), endgame, north star, flywheel. Pick the concrete word: "substrate" becomes "base", "wedge in" becomes "add", "vector" becomes "way", "gold-plating" becomes "more than the job needs", "ratchet" becomes the mechanism's real name or "a limit that only tightens", "evacuate" becomes "move out", "endgame" becomes "the last phase".

## Plain speech

27. **Say what it does, not how it feels.** "the database stays close at hand", "SQL you can read", "types that follow your schema" name a feeling. Name the mechanism or a number: "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". Two checks: if the sentence cannot be restated as a concrete instruction, fact, or number, cut it; if it could appear unchanged in another project's docs, cut it.
28. **Dense sentences.** If the reader has to backtrack, split it or drop clauses. One idea per sentence.
29. **Active voice.** Catch "is/are/was/were + past participle" and name the actor: "queries are validated" becomes "the compiler validates queries". Passive only when the actor is unknown or does not matter.
30. **Adverbs.** "runs quickly" becomes "is fast" or the number. "significantly improves" becomes the measured delta.
31. **Plain word.** "utilize" and "leverage" become "use", "facilitate" becomes "help", "numerous" becomes "many", "in the event that" becomes "if".
32. **Mannered prose.** Aphorisms ("wire it or delete it"), rhetorical fragments, personified code ("the plan holds it"), figurative verbs ("rides along", "stands on"), stock framing. "A dial worth turning" becomes "a parameter worth varying". Rule 26 covers the metaphor nouns.
33. **Over-compression.** Dropped articles, verbless fragments, symbol-speak, abbreviations. "Parser rejects bad date → exit 2, no write" becomes "The parser rejects a bad date, exits with code 2, and writes nothing." Whole sentences with their articles and verbs; arrows and abbreviations spelled out.
