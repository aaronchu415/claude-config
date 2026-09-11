---
name: grill-me
description: A relentless interview that sharpens a plan, TRD, or design before it is written. Aaron starts it; nothing fires it on its own.
disable-model-invocation: true
---

Interview Aaron until you reach a shared understanding. Map the plan as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are settled: the questions you can ask now without guessing at answers you have not heard. Ask the whole frontier in one round, numbered, each with your recommended answer. Then wait.

```
❓ **Q1** - **<question title>**: <question body, may include choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body>

➡️ <your recommended answer>
```

Each answered round reshapes the tree: settled decisions push the frontier outward and unblock what depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open this round belongs to a later round.

Facts are your job, never Aaron's. When a frontier question needs a fact from the environment (a file, a schema, a vendor type, a CMS field), dispatch a sub-agent for it; only the questions downstream of that lookup wait. Decisions are Aaron's: put each to him and wait.

Done when the frontier is empty: every branch visited, nothing silently assumed. Do not act on the plan until Aaron confirms the shared understanding.
