import type { Position } from './player'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'competitive'

export type SkillArea = 'shooting' | 'movement' | 'communication' | 'game-sense' | 'fitness' | 'mental-game'

export type FocusArea = 'snap-shooting' | 'bunkering' | 'lane-control' | 'breakouts' | 'rotations' | 'field-awareness' | 'mental-toughness' | 'decision-making'

export interface OnboardingData {
  completed: boolean
  playerName: string
  currentLevel: SkillLevel
  primaryPosition: Position
  secondaryPositions: Position[]  // multi-position support
  skillAreas: SkillArea[]
  focusAreas: FocusArea[]
  competition: string
  weeklyTrainingHours: number
  weeklyGoals: string[]
  newsletter: boolean
  benchmarkOptIn: boolean  // opt-in for anonymous division percentile benchmarking
}

export const SKILL_LEVELS: { value: SkillLevel; label: string; description: string; division: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just getting started with competitive play', division: 'D5' },
  { value: 'intermediate', label: 'Intermediate', description: 'Regular rec/local tournaments, learning positions', division: 'D4' },
  { value: 'advanced', label: 'Advanced', description: 'D4-D3 competitive play, solid fundamentals', division: 'D3' },
  { value: 'competitive', label: 'Competitive', description: 'D2-D1 or Semi-Pro, tournament veteran', division: 'D2' },
]

export const SKILL_AREAS: { value: SkillArea; label: string; icon: string }[] = [
  { value: 'shooting', label: 'Snap Shooting & Accuracy', icon: '🎯' },
  { value: 'movement', label: 'Movement & Bunkering', icon: '💨' },
  { value: 'communication', label: 'Communication & Calls', icon: '📡' },
  { value: 'game-sense', label: 'Game Sense & Strategy', icon: '🧠' },
  { value: 'fitness', label: 'Speed & Fitness', icon: '⚡' },
  { value: 'mental-game', label: 'Mental Game & Composure', icon: '🧘' },
]

export const FOCUS_AREAS: { value: FocusArea; label: string }[] = [
  { value: 'snap-shooting', label: 'Snap Shooting' },
  { value: 'bunkering', label: 'Bunkering' },
  { value: 'lane-control', label: 'Lane Control' },
  { value: 'breakouts', label: 'Breakout Execution' },
  { value: 'rotations', label: 'Rotations & Moves' },
  { value: 'field-awareness', label: 'Field Awareness' },
  { value: 'mental-toughness', label: 'Mental Toughness' },
  { value: 'decision-making', label: 'Decision Making' },
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
    secondaryPositions: [],
    skillAreas: [],
    focusAreas: [],
    competition: '',
    weeklyTrainingHours: 4,
    weeklyGoals: [],
    newsletter: false,
    benchmarkOptIn: false,
  }
}
