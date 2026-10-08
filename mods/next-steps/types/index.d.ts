export type NextSteps = { turnId: string; items: string[] }
export type Tally = { shown: number; picked: number }

declare module 'claude-code' {
  interface PluginState {
    'next-steps': { steps: NextSteps | null; active: boolean }
  }
}
