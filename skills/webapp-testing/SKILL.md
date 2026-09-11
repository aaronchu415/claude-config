---
name: webapp-testing
description: Playwright scripts against a local web app. Use to verify a UI change in a real browser, screenshot a page, or read its console logs.
license: Complete terms in LICENSE.txt
---

# Web application testing

Write a Python Playwright script and run it with the skill's venv interpreter, `~/.claude/skills/webapp-testing/.venv/bin/python` (Python 3.13; system `python3` is 3.14 and has no `playwright` module). Launch chromium headless.

`examples/` has one script per pattern (element discovery, static `file://` HTML, console log capture); copy the nearest one. `scripts/with_server.py` starts one or more servers, waits for their ports, runs your script, and stops them; `--help` is the usage. Call it as a black box.

## Choosing the path

- **Static HTML**: read the file for selectors, write the script, `page.goto('file://...')`.
- **Dynamic app, no server running**: `~/.claude/skills/webapp-testing/.venv/bin/python scripts/with_server.py --server "pnpm dev" --port 3000 -- <venv python> your_script.py`.
- **Dynamic app, server already running**: run the script directly against the live port. `with_server.py` decides "ready" by connecting to the port, so pointed at a port that already has a server it false-readies on the squatter, the new server dies with `EADDRINUSE`, and on stop it leaks an orphaned child (it uses `shell=True`). Two `next dev --turbopack` on the same app corrupt the shared `.next` and `/` hangs in curl and the browser alike. Recovery: kill every `next` process (`pkill -f "<app>/node_modules/.*next dev --turbopack"`), `rm -rf <app>/.next`, start one server.

## Reconnaissance, then action

1. Navigate and wait for the page to settle. `page.wait_for_load_state('networkidle')` on most apps. On a Next dev server use `wait_until="domcontentloaded"`, then `wait_for_load_state("load")`, then a short settle: turbopack HMR holds a websocket open, so `networkidle` never arrives and `goto` times out.
2. Inspect the rendered state: `page.screenshot(path='/tmp/inspect.png', full_page=True)`, `page.content()`, `page.locator('button').all()`.
3. Act with the selectors found there (`text=`, `role=`, ids), waiting on `page.wait_for_selector()` between steps.
