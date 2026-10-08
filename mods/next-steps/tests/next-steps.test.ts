import { describe, expect, test } from 'claude-code/testing'

import { fitsOnOneLine, forkPrompt, parseSteps } from '../hooks/register'

const BAND = { component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 160 } }
const ANSWER = 'I wrote tests for the login form and they pass locally.'
const REPLY = 'NEXT: Run the tests you just wrote\nNEXT: Do the same for settings\nNEXT: Open a draft PR'
const LETS_COOK = '# lets-cook\n\n## Routing table\n\n| Commit | `ce-commit` |'

const wait = () => new Promise(done => (globalThis as any).setTimeout(done, 10))

// Stands for the engine beneath the mod. `reply` may hold the model call until the test lets it go.
type Options = { agents?: unknown[]; surfaces?: string[]; saved?: unknown; unanswered?: boolean }

function engine(on: any, reply: () => Promise<string> | string, { agents = [], surfaces = ['terminal'], saved, unanswered }: Options = {}) {
  let calls = 0
  const prompts: string[] = []
  let stored = saved
  on('session.surfaces', () => ({ value: surfaces }))
  on('env.get', () => ({ value: '/home/me' }))
  on('fs.read', (_$: any, e: any) => ({ value: e.path === '/home/me/.claude/skills/lets-cook/SKILL.md' ? LETS_COOK : '' }))
  on('store.get', () => ({ value: stored }))
  on('store.set', (_$: any, e: any) => {
    stored = e.value
    return { value: undefined }
  })
  on('session.start', (_$: any, e: any) => ({ sessionId: 's', cwd: e.cwd }))
  on('prompt.submit', () => ({ text: '' }))
  on('turn.start', (_$: any, e: any) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  on('agent.list', () => ({ value: agents }))
  on('session.messages', () => ({ value: [{ role: 'user', text: 'add tests for the login form', toolUses: [] }] }))
  on('model.fork', async (_$: any, e: any) => {
    calls++
    prompts.push(e.prompt)
    if (unanswered) return { value: { isAnswered: false, reason: 'nothing-to-fork' } }
    return { value: { isAnswered: true, text: await reply(), usage: { input_tokens: 1, output_tokens: 1 } } }
  })
  // The editor: splice what was typed into the draft.
  on('prompt.edit', (_$: any, e: any) => {
    const text = e.text.slice(0, e.start) + e.inputText + e.text.slice(e.end)
    return { text, cursor: e.start + e.inputText.length }
  })
  on('ui.render', ($: any, e: any) => {
    const { Text } = $.ui.resolve(e)
    return Text({ children: 'band below' }) // stands for other mods' bands
  })
  return { calls: () => calls, prompts: () => prompts, stored: () => stored }
}

async function finishTurn($: any, turnId = 't1', answer = ANSWER) {
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  await $.turn.start({ text: 'add tests', turnId })
  await $.turn.complete({ reason: 'answer', answer, durationMs: 1, isAborted: false, turnId })
  await wait()
}

const band = ($: any, columns = 160) =>
  $.ui.mount({ plugin: 'next-steps', surface: 'terminal', ...BAND, props: { ...BAND.props, bodyColumns: columns } })

const key = (text: string, inputText: string) => ({
  origin: { kind: 'composer' },
  text,
  cursor: text.length,
  start: text.length,
  end: text.length,
  inputText,
  key: { key: inputText },
})

describe('next-steps', () => {
  test('shows the suggestions after a turn, above what was already there', async ($, on) => {
    engine(on, () => REPLY)
    await finishTurn($)
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /^next: {2}$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^Run the tests you just wrote$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^Open a draft PR$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^dismiss$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /band below/ })).toBeDefined()
    await ui.unmount()
  })

  test('one per row when the band is narrow', async ($, on) => {
    engine(on, () => REPLY)
    await finishTurn($)
    const ui = await band($, 50)
    expect(await ui.find({ type: 'Text', text: /^ {7}$/ })).toBeDefined()
    await ui.unmount()
  })

  test('ignores a result that arrives after a newer turn started', async ($, on) => {
    let release: (s: string) => void = () => {}
    const held = new Promise<string>(done => (release = done))
    engine(on, () => held)
    await finishTurn($, 't1')
    await $.turn.start({ text: 'something else', turnId: 't2' } as any)
    release(REPLY)
    await wait()
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /Run the tests/ })).toBeUndefined()
    await ui.unmount()
  })

  test('a digit in an empty prompt drafts that suggestion', async ($, on) => {
    engine(on, () => REPLY)
    await finishTurn($)
    const r = await $.prompt.edit(key('', '2') as any)
    expect(r.text).toBe('Do the same for settings')
    expect(r.cursor).toBe('Do the same for settings'.length)
  })

  test('a digit in a prompt with text types as usual', async ($, on) => {
    engine(on, () => REPLY)
    await finishTurn($)
    const r = await $.prompt.edit(key('fix bug ', '1') as any)
    expect(r.text).toBe('fix bug 1')
  })

  test('a pasted digit lands as text', async ($, on) => {
    engine(on, () => REPLY)
    await finishTurn($)
    const { key: _key, ...paste } = key('', '1')
    expect((await $.prompt.edit(paste as any)).text).toBe('1')
  })

  test('ignores a result that arrives after a prompt was sent', async ($, on) => {
    let release: (s: string) => void = () => {}
    const held = new Promise<string>(done => (release = done))
    engine(on, () => held)
    await finishTurn($, 't1')
    await $.prompt.submit({ text: 'go on', wait: false, origin: { kind: 'composer' } } as any)
    release(REPLY)
    await wait()
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /Run the tests/ })).toBeUndefined()
    await ui.unmount()
  })

  test('skips subagent turns', async ($, on) => {
    const eng = engine(on, () => REPLY)
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' } as any)
    await $.turn.complete({ reason: 'answer', answer: ANSWER, durationMs: 1, isAborted: false, turnId: 'x', agentId: 'a1' } as any)
    await wait()
    expect(eng.calls()).toBe(0)
  })

  test('a digit with no suggestion for it types as usual', async ($, on) => {
    engine(on, () => REPLY)
    await finishTurn($)
    expect((await $.prompt.edit(key('', '7') as any)).text).toBe('7')
  })

  test('0 dismisses the list and types nothing', async ($, on) => {
    engine(on, () => REPLY)
    await finishTurn($)
    const r = await $.prompt.edit(key('', '0') as any)
    expect(r.text).toBe('')
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /Run the tests/ })).toBeUndefined()
    await ui.unmount()
    expect((await $.prompt.edit(key('', '1') as any)).text).toBe('1') // nothing left to pick
  })

  test('a submitted prompt clears the list', async ($, on) => {
    engine(on, () => REPLY)
    await finishTurn($)
    await $.prompt.submit({ text: 'go on', wait: false, origin: { kind: 'composer' } } as any)
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /Run the tests/ })).toBeUndefined()
    await ui.unmount()
  })

  test('hidden, with no model call, after a trivial turn', async ($, on) => {
    const eng = engine(on, () => REPLY)
    await finishTurn($, 't1', 'Done.')
    expect(eng.calls()).toBe(0)
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /next:/ })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /band below/ })).toBeDefined()
    await ui.unmount()
  })

  test('hidden when the model has nothing to suggest', async ($, on) => {
    engine(on, () => '')
    await finishTurn($)
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /next:/ })).toBeUndefined()
    await ui.unmount()
  })

  test('tells where-am-i only while the list shows', async ($, on) => {
    engine(on, () => REPLY)
    const written: unknown[] = [] // what next-steps tells where-am-i, in order
    on('state.set', { plugin: 'next-steps', key: 'active' }, (_$: any, e: any) => {
      written.push(e.value)
      return { value: { isSet: true, version: written.length } }
    })
    on('state.get', { plugin: 'next-steps', key: 'active' }, () => ({ value: { value: written.at(-1), version: written.length } }))
    await finishTurn($)
    expect(written.at(-1)).toBe(true)
    await $.prompt.edit(key('', '0') as any)
    expect(written.at(-1)).toBe(false)
  })

  test('waits while background agents still run', async ($, on) => {
    const eng = engine(on, () => REPLY, { agents: [{ id: 'a1', description: 'tests', type: 'general-purpose', status: 'running' }] })
    await finishTurn($)
    expect(eng.calls()).toBe(0)
  })

  test('stays idle where nothing draws, as in T3 Code', async ($, on) => {
    const eng = engine(on, () => REPLY, { surfaces: [] })
    await finishTurn($)
    expect(eng.calls()).toBe(0)
  })

  test('asks with the lets-cook routes and the latest reply', async ($, on) => {
    const eng = engine(on, () => REPLY)
    await finishTurn($)
    expect(eng.prompts()[0]).toContain('| Commit | `ce-commit` |')
    expect(eng.prompts()[0]).toContain(ANSWER)
  })

  test('counts a picked suggestion and shows the tally', async ($, on) => {
    const eng = engine(on, () => REPLY)
    await finishTurn($, 't1')
    await $.prompt.edit(key('', '2') as any)
    await $.prompt.submit({ text: 'Do the same for settings', wait: false, origin: { kind: 'composer' } } as any)
    await wait()
    expect(eng.stored()).toEqual({ shown: 1, picked: 1 })
    await finishTurn($, 't2')
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /^ {2}\(1\/1 used\)$/ })).toBeDefined()
    await ui.unmount()
  })

  test('counts a typed prompt as unused', async ($, on) => {
    const eng = engine(on, () => REPLY)
    await finishTurn($)
    await $.prompt.submit({ text: 'something else', wait: false, origin: { kind: 'composer' } } as any)
    await wait()
    expect(eng.stored()).toEqual({ shown: 1, picked: 0 })
  })

  test('nothing counted when no list was showing', async ($, on) => {
    const eng = engine(on, () => REPLY)
    await $.prompt.submit({ text: 'hello', wait: false, origin: { kind: 'composer' } } as any)
    await wait()
    expect(eng.stored()).toBeUndefined()
  })

  test('a submit the person did not type is not counted', async ($, on) => {
    const eng = engine(on, () => REPLY)
    await finishTurn($)
    await $.prompt.submit({ text: 'agent finished', wait: false, origin: { kind: 'task-notification' } } as any)
    await wait()
    expect(eng.stored()).toBeUndefined()
  })

  test('hidden when the fork does not answer', async ($, on) => {
    engine(on, () => REPLY, { unanswered: true })
    await finishTurn($)
    const ui = await band($)
    expect(await ui.find({ type: 'Text', text: /next:/ })).toBeUndefined()
    await ui.unmount()
  })

  test('keeps only the NEXT lines, cleaned', () => {
    expect(parseSteps('Sure.\nNEXT: Run the tests.\n- NEXT: Open a PR \u2014 draft\n**NEXT:** "Ship it"\nNEXT: four')).toEqual(['Run the tests', 'Open a PR, draft', 'Ship it'])
    expect(parseSteps('NONE')).toEqual([])
    expect(parseSteps('**TL;DR:** done\nNEXT: run it\nNEXT: Run it')).toEqual(['run it'])
    expect(parseSteps(`NEXT: ${'word '.repeat(30)}\nNEXT: short one`)).toEqual(['short one']) // too long: dropped, not cut
    expect(fitsOnOneLine(['a', 'b'], 40)).toBe(true)
    expect(fitsOnOneLine(['a', 'b'], 40, 20)).toBe(false)
    expect(fitsOnOneLine(['a'.repeat(40), 'b'.repeat(40)], 80)).toBe(false)
  })

  test('leaves out the routes when lets-cook is missing', () => {
    expect(forkPrompt('ok', '')).not.toContain('<routes>')
  })
})
