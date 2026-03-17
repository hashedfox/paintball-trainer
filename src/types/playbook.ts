import type { Position } from './player'

export type FieldArchetype = 'standard-212' | 'long-linear-snake' | 'diagonal-symmetry'

export interface BreakoutPlay {
  name: string
  description: string
  positions: Record<Position, string>
}

export interface Formation {
  name: string
  positions: Record<Position, { bunker: string; role: string }>
}

export interface SwotData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface FieldLayoutData {
  archetype: FieldArchetype
  name: string
  description: string
  swot: SwotData
  formations: Formation[]
  breakoutPlays: BreakoutPlay[]
  proReference: string
}
