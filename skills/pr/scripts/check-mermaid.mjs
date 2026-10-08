// Usage: node check-mermaid.mjs <file.md>  -> exit 1 if any ```mermaid block fails to parse.
// Deps live outside this repo: npm i --prefix ~/.cache/mermaid-check mermaid@11 jsdom@26
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { createRequire } from "node:module";

const require = createRequire(`${homedir()}/.cache/mermaid-check/`);
const { JSDOM } = require("jsdom");
const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.DOMParser = dom.window.DOMParser;
const { default: mermaid } = await import(require.resolve("mermaid"));

const blocks = [...readFileSync(process.argv[2], "utf8").matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
let failed = 0;
for (const [i, src] of blocks.entries()) {
  try {
    await mermaid.parse(src);
  } catch (err) {
    failed++;
    console.error(`mermaid block ${i + 1}: ${err.message.split("\n").slice(0, 3).join("\n")}`);
  }
}
console.log(`${blocks.length - failed}/${blocks.length} mermaid blocks parse`);
process.exit(failed ? 1 : 0);
