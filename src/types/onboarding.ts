import type { Position } from './player'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'competitive'

export type SkillArea = 'shooting' | 'movement' | 'communication' | 'game-sense' | 'fitness'

export type FocusArea = 'snap-shooting' | 'bunkering' | 'lane-control' | 'breakouts' | 'rotations' | 'field-awareness'

export interface OnboardingData {
  completed: boolean
  playerName: string
  currentLevel: SkillLevel
  primaryPosition: Position
  skillAreas: SkillArea[]
  focusAreas: FocusArea[]
  competition: string
  weeklyTrainingHours: number
  weeklyGoals: string[]
  newsletter: boolean
}

export const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just getting started with competitive play' },
  { value: 'intermediate', label: 'Intermediate', description: 'Regular rec/local tournaments, learning positions' },
  { value: 'advanced', label: 'Advanced', description: 'D4-D3 competitive play, solid fundamentals' },
  { value: 'competitive', label: 'Competitive', description: 'D2-D1 or Semi-Pro, tournament veteran' },
]

export const SKILL_AREAS: { value: SkillArea; label: string; icon: string }[] = [
  { value: 'shooting', label: 'Snap Shooting & Accuracy', icon: '🎯' },
  { value: 'movement', label: 'Movement & Bunkering', icon: '💨' },
  { value: 'communication', label: 'Communication & Calls', icon: '📡' },
  { value: 'game-sense', label: 'Game Sense & Strategy', icon: '🧠' },
  { value: 'fitness', label: 'Speed & Fitness', icon: '⚡' },
]

export const FOCUS_AREAS: { value: FocusArea; label: string }[] = [
  { value: 'snap-shooting', label: 'Snap Shooting' },
  { value: 'bunkering', label: 'Bunkering' },
  { value: 'lane-control', label: 'Lane Control' },
  { value: 'breakouts', label: 'Breakout Execution' },
  { value: 'rotations', label: 'Rotations & Moves' },
  { value: 'field-awareness', label: 'Field Awareness' },
]

export const COMPETITIONS = [
  'NXL - National Xball League',
  'MSXL - Mid South Xball League',
  'AXBL - Atlantic Xball League',
  'WCPPL - West Coast Paintball Players League',
  'ICPL - International Classic Paintball League',
  'CPPL - Central Plains Paintball League',
  'Local / Regional',
  'Rec / Scenario',
  'Other',
]

export function createDefaultOnboarding(): OnboardingData {
  return {
    completed: false,
    playerName: '',
    currentLevel: 'intermediate',
    primaryPosition: 'centre',
    skillAreas: [],
    focusAreas: [],
    competition: '',
    weeklyTrainingHours: 4,
    weeklyGoals: [],
    newsletter: false,
  }
}
