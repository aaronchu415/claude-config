# Mechanized checks

Both run from pnpm's throwaway dlx cache; nothing touches package.json or the lockfile.

## Readability panel (sonarjs)

Curated sonarjs rules covering the legibility bar: deep nesting and nested ternaries (split rule), commented-out code, duplicated branches, identical functions, redundant returns/jumps, over-complex booleans, cognitive complexity. Run over a scope, cwd = the package:

```bash
cat > /tmp/readability.config.mjs <<'CFG'
import { createRequire } from "node:module";
const req = createRequire(`${process.env.PATH.split(":")[0]}/_.js`);
const tseslint = req("typescript-eslint");
const m = req("eslint-plugin-sonarjs");
const rules = Object.fromEntries([
  "cognitive-complexity",
  "nested-control-flow",
  "no-nested-conditional",
  "no-nested-functions",
  "no-nested-switch",
  "no-nested-template-literals",
  "expression-complexity",
  "no-inverted-boolean-check",
  "no-redundant-boolean",
  "no-gratuitous-expressions",
  "no-collapsible-if",
  "prefer-immediate-return",
  "prefer-single-boolean-return",
  "no-redundant-jump",
  "no-duplicated-branches",
  "no-identical-functions",
  "no-commented-code",
  "no-dead-store",
  "no-small-switch",
].map((r) => [`sonarjs/${r}`, "warn"]));
export default [{
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: { parser: tseslint.parser },
  plugins: { sonarjs: m.default ?? m },
  rules,
}];
CFG
pnpm --package=eslint@9 --package=typescript@5.9.3 --package=typescript-eslint@8 --package=eslint-plugin-sonarjs \
  dlx eslint src --no-config-lookup --config /tmp/readability.config.mjs --format json -o /tmp/readability.json
```

Reading the output:

- Keep only `sonarjs/*` ruleIds; stray `@typescript-eslint/no-unsafe-*` messages leak into the report unasked.
- `no-nested-functions` hits in `*.test.ts` are idiomatic `describe`/`it` nesting; skip them.
- Defaults (nesting 3, boolean operators 3, cognitive 15) are well calibrated: 2026-08-20 the panel returned 13 hits across a whole backend package (11 real: one cognitive-37 function, nested ternaries, commented-out code, a redundant jump) and 2 across a second package. A hit is worth reading, not auto-fixing: `no-small-switch` and friends are suggestions, cognitive >15 is close to always right.
- To SCORE every function rather than flag offenders: `"sonarjs/cognitive-complexity": ["warn", 0]`. The score is in each message ("... from N to the 0 allowed"); a function absent from the report is 0.
- The pins matter: unpinned dlx grabs eslint 10 + TypeScript 7, which typescript-eslint rejects. Bump the pins when the repo's versions move (typescript pin = repo's installed version).
- Naming rules were evaluated and rejected (2026-08-20): a boolean-prefix test-fire (`@typescript-eslint/naming-convention`, is/has/should/...) over a whole package yielded ONE hit, `alreadyExisted`, which is a fine name. Naming stays a semantic judgment call; no regex reads meaning.

### Per-line breakdown of one function

`sonar-runtime` mode was removed from the current plugin, so this pins the old standalone one (scores drift +/-1 from the modern rule; direction is what matters):

```bash
pnpm --package=eslint@8.57.1 --package=eslint-plugin-sonarjs@0.25.1 \
  --package=@typescript-eslint/parser@7.18.0 --package=typescript@5.5.4 \
  dlx sh -c 'ROOT="$(command -v eslint)"; ROOT="${ROOT%/.bin/eslint}"; \
    ESLINT_USE_FLAT_CONFIG=false eslint <file.ts> --no-eslintrc \
    --parser "$ROOT/@typescript-eslint/parser/dist/index.js" \
    --plugin sonarjs --rule "{\"sonarjs/cognitive-complexity\":[\"warn\",0,\"sonar-runtime\"]}" \
    --resolve-plugins-relative-to "$ROOT/.." --format json -o /tmp/cog-detail.json'
```

Each message carries `secondaryLocations`: one `+N` per line that adds cost. The parser must be the `dist/index.js` FILE path (the directory form fails to load), and `ESLINT_USE_FLAT_CONFIG=false` is required or eslint 8 sees the repo's flat config and rejects the legacy flags.

## Mutation check (Stryker)

Per package, no install, delete the config after. Never diff-wide: cost is mutants x suite runtime (~25s for one 60-line file).

```bash
# cwd = the package, e.g. packages/<name>
pnpm dlx @stryker-mutator/core@8 run stryker.conf.json
```

```json
{
  "packageManager": "pnpm",
  "testRunner": "command",
  "commandRunner": { "command": "npx vitest run" },
  "coverageAnalysis": "off",
  "mutate": ["src/<file>.ts"],
  "ignorePatterns": ["tsconfig.json", "dist", ".turbo"],
  "reporters": ["clear-text", "progress"],
  "concurrency": 4
}
```

`ignorePatterns` must include `tsconfig.json`, or Stryker imports `typescript` from the dlx temp dir and dies with `ERR_MODULE_NOT_FOUND` after it has already printed "Instrumented 1 source file(s)", so the error looks unrelated. At 100% coverage CRAP collapses to raw cyclomatic complexity and says nothing.

Why it is worth the runtime: a PII redactor at 100% statement coverage scored 70.59%, and five PII keys could be deleted from the redaction set with all 13 tests still green. Coverage % and CRAP flag none of that. Survivors cluster into three shapes:

- a key or branch masked by an already-redacted sibling, so removing it changes nothing observable in the assertion
- an assertion that checks a value is absent but never checks what replaced it
- untested `null`/`undefined` input
