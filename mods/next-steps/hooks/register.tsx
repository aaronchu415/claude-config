// Next Steps: after each turn, 2 or 3 likely next prompts above the input.
// In an empty prompt, 1 to 3 drafts one (nothing sends on its own) and 0 dismisses.
// Forked from hamzafer/claude-code-mods (MIT): asks the session's own model over the whole
// transcript, routes with lets-cook's table, and stays idle where nothing draws (T3 Code, claude -p).
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { NextSteps, Tally } from '../types'

const MAX_ITEMS = 3
const MAX_CHARS = 60 // what the model is asked for
const MAX_KEPT = 120 // a longer line is dropped, never cut: a cut draft would send half a prompt
const MIN_ANSWER = 20 // a reply shorter than this is not worth a model call
const ROUTES = '.claude/skills/lets-cook/SKILL.md'

// Held by the host, so the list survives a hot reload of this file.
const steps = atom({ plugin: 'next-steps', key: 'steps' } as const, null as NextSteps | null)
// True while the list is on screen. where-am-i reads it and leaves out its own "next" meanwhile.
const active = atom({ plugin: 'next-steps', key: 'active' } as const, false)

let routes: string | null = null
let counts: Tally | null = null

export const register: Register = on => {
  // The turn a suggestion may still be shown for. A submit or a new turn moves it on.
  let latest = ''
  let submits = 0
  // A survey answers bare digits in the band: leave them to it.
  let hasSurvey = false
  let picked: number | null = null

  on('prompt.submit', async ($, e, next) => {
    latest = `submit-${++submits}`
    const shown = await read($, steps)
    if (shown && e.origin?.kind === 'composer') void count($, picked !== null).catch(() => {})
    picked = null
    await setSteps($, () => null)
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    latest = e.turnId
    await setSteps($, () => null)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId) return r // a subagent's turn, not the person's
    latest = e.turnId // also for a turn that raised no turn.start, and after a hot reload
    if (e.reason !== 'answer' || e.answer.trim().length < MIN_ANSWER) return r
    void suggest($, e.turnId, e.answer, () => latest).catch(() => {}) // in the background, so the turn ends at once
    return r
  })

  // A digit typed into an empty prompt picks a suggestion instead of landing as text.
  // A paste carries no key, so a pasted "1" lands as typed.
  on('prompt.edit', async ($, e, next) => {
    if (hasSurvey || !e.key || e.key.ctrl || e.key.meta || e.text !== '' || e.start !== 0 || e.end !== 0 || !/^[0-9]$/.test(e.inputText)) return next(e)
    const s = await read($, steps)
    if (!s) return next(e)
    if (e.inputText === '0') {
      await setSteps($, () => null)
      return { text: '', cursor: 0 } // consumed: the box stays empty
    }
    const index = Number(e.inputText) - 1
    const pick = s.items[index]
    if (!pick) return next(e)
    picked = index
    return next({ ...e, inputText: pick }) // a draft: the person edits it or presses Enter
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const rest = await next(e) // what other mods and Claude Code draw here stays
    hasSurvey = e.props.hasSurvey
    const s = await read($, steps)
    if (e.props.hasSurvey || e.props.isWorking || !s || s.items.length === 0) return rest

    const { Box, Text } = $.ui.resolve(e)
    const sep = <Text dimColor>{'  ·  '}</Text>
    const item = (text: string, i: number) => [
      <Text color="cyan" bold>{`${i + 1} `}</Text>,
      <Text>{text}</Text>,
    ]
    const used = tally()
    const dismiss = [<Text color="cyan" bold>{'0 '}</Text>, <Text dimColor>dismiss</Text>, ...(used ? [<Text dimColor>{used}</Text>] : [])]

    const lines =
      // One per row needs a row each; a short band gets the one row, cut at its end.
      fitsOnOneLine(s.items, e.props.bodyColumns, used.length) || e.props.maxRows < s.items.length + 2 ? (
        <Text wrap="truncate-end">
          <Text dimColor>{'next:  '}</Text>
          {s.items.flatMap((t, i) => [...item(t, i), sep])}
          {dismiss}
        </Text>
      ) : (
        <Box flexDirection="column">
          {s.items.map((t, i) => (
            <Text wrap="truncate-end">
              <Text dimColor>{i === 0 ? 'next:  ' : '       '}</Text>
              {item(t, i)}
              {i === s.items.length - 1 && sep}
              {i === s.items.length - 1 && dismiss}
            </Text>
          ))}
        </Box>
      )

    return (
      <Box flexDirection="column">
        <Box paddingX={1}>{lines}</Box>
        {rest}
      </Box>
    )
  })
}

// Writes the list, then whether it shows, for where-am-i.
async function setSteps($: EngineInterface, fn: (before: NextSteps | null) => NextSteps | null) {
  const after = await update($, steps, fn)
  const showing = after !== null && after.items.length > 0
  if ((await read($, active)) !== showing) await update($, active, () => showing)
}

// The whole list on one row, or one suggestion per row when it would not fit.
export function fitsOnOneLine(items: string[], columns: number, extra = 0) {
  const width = 'next:  '.length + items.reduce((n, t) => n + 2 + t.length + 5, 0) + '0 dismiss'.length + extra
  return width <= columns - 2 // the band's padding
}

function tally() {
  return counts && counts.shown > 0 ? `  (${counts.picked}/${counts.shown} used)` : ''
}

// How often a showing list was used, across every session on the machine.
async function count($: EngineInterface, isPicked: boolean) {
  const before = await loadCounts($)
  counts = { shown: before.shown + 1, picked: before.picked + (isPicked ? 1 : 0) }
  await $.store.set('tally', counts)
}

async function loadCounts($: EngineInterface): Promise<Tally> {
  const saved = (await $.store.get('tally').catch(() => undefined)) as Tally | undefined
  return saved ?? { shown: 0, picked: 0 }
}

async function loadRoutes($: EngineInterface) {
  if (routes !== null) return routes
  const home = await $.env.get('HOME')
  const skill = await $.fs.read(`${home}/${ROUTES}`).catch(() => '')
  const start = skill.indexOf('## Routing table')
  routes = start === -1 ? '' : skill.slice(start)
  return routes
}

async function suggest($: EngineInterface, turnId: string, answer: string, current: () => string) {
  if ((await $.session.surfaces()).length === 0) return // nothing would draw the list
  // Wait for background agents: the main agent picks up again once they finish.
  const agents = await $.agent.list().catch(() => [])
  if (agents.some(a => a.status === 'running')) return

  const [table, saved] = await Promise.all([loadRoutes($), loadCounts($)])
  counts = saved
  const r = await $.model.fork({ prompt: forkPrompt(answer, table) })
  if (!r.isAnswered) return
  const items = parseSteps(r.text)
  // Checked inside the write, so a submit or a new turn that lands meanwhile always wins.
  await setSteps($, before => (current() !== turnId ? before : items.length > 0 ? { turnId, items } : null))
}

export function forkPrompt(answer: string, table: string) {
  return [
    `<latest_reply>\n${answer.slice(0, 2000)}\n</latest_reply>`,
    'This message is not from the person, and your reply is never shown to them. Set the task aside and ignore the output style. ' +
      `Predict the 2 or 3 prompts the person is most likely to type next. Each is an instruction under ${MAX_CHARS} characters, ` +
      'specific to this session: name the file, PR, ticket or skill. When the stage of work makes one of their routes the obvious next step, ' +
      'suggest that skill as a slash command, such as /ce-commit-push-pr. Plain words, no em dashes.',
    table && `Their routes, by stage of work:\n<routes>\n${table}\n</routes>`,
    'Reply with only the lines, each starting with "NEXT: ". If nothing sensible follows, reply NONE.',
  ]
    .filter(Boolean)
    .join('\n\n')
}

// Only the NEXT: lines, cleaned: no bullets, bold, quotes or em dashes; at most three.
// A line too long to draft whole is dropped.
export function parseSteps(text: string): string[] {
  const out: string[] = []
  for (const line of text.split('\n')) {
    const m = /^\s*(?:[-*•]\s*)?(?:\*\*)?NEXT:(?:\*\*)?\s*(.*)$/i.exec(line)
    if (!m) continue
    const clean = m[1]
      .replace(/\*\*/g, '')
      .replace(/^["'`]+|["'`,]+$/g, '')
      .replace(/\s*—\s*/g, ', ')
      .replace(/\.$/, '')
      .trim()
    if (clean === '' || clean.length > MAX_KEPT) continue
    if (!out.some(o => o.toLowerCase() === clean.toLowerCase())) out.push(clean)
    if (out.length === MAX_ITEMS) break
  }
  return out
}
