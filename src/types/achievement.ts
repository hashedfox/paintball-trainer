/** Achievement & Badge system */

import type { PPIAxis } from './ppi'

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond'
export type BadgeCategory = PPIAxis | 'meta'

export interface Achievement {
  id: string
  name: string
  description: string
  category: BadgeCategory
  tier: BadgeTier
  icon: string
  requirement: string  // human-readable condition
  unlocked: boolean
  unlockedDate?: string
  progress: number  // 0-100
}

export interface DivisionInfo {
  id: string
  name: string
  shortName: string
  minPPI: number
  maxPPI: number
  color: string
  description: string
}

export const DIVISIONS: DivisionInfo[] = [
  { id: 'd5', name: 'Division 5', shortName: 'D5', minPPI: 0, maxPPI: 30, color: '#8B949E', description: 'Entry level competitive play' },
  { id: 'd4', name: 'Division 4', shortName: 'D4', minPPI: 31, maxPPI: 45, color: '#58A6FF', description: 'Building fundamentals' },
  { id: 'd3', name: 'Division 3', shortName: 'D3', minPPI: 46, maxPPI: 60, color: '#A371F7', description: 'Solid competitive player' },
  { id: 'd2', name: 'Division 2', shortName: 'D2', minPPI: 61, maxPPI: 72, color: '#E3B341', description: 'Advanced competitor' },
  { id: 'd1', name: 'Division 1', shortName: 'D1', minPPI: 73, maxPPI: 82, color: '#F0883E', description: 'Elite division player' },
  { id: 'semi', name: 'Semi-Pro', shortName: 'Semi', minPPI: 83, maxPPI: 90, color: '#F85149', description: 'Near professional level' },
  { id: 'pro', name: 'Professional', shortName: 'Pro', minPPI: 91, maxPPI: 100, color: '#39D353', description: 'Professional competitive level' },
]

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Snap Shooting
  { id: 'snap-quick-draw', name: 'Quick Draw', description: 'Complete 100 snaps under 200ms', category: 'snapShooting', tier: 'bronze', icon: '🎯', requirement: '100 snaps < 200ms', unlocked: false, progress: 0 },
  { id: 'snap-ambidextrous', name: 'Ambidextrous', description: 'Equal left/right snap scores', category: 'snapShooting', tier: 'silver', icon: '🔄', requirement: 'L/R within 5%', unlocked: false, progress: 0 },
  { id: 'snap-sharpshooter', name: 'Sharpshooter', description: '95%+ accuracy streak in snaps', category: 'snapShooting', tier: 'gold', icon: '⚡', requirement: '10 sessions at 95%+', unlocked: false, progress: 0 },

  // Movement
  { id: 'move-speedster', name: 'Speedster', description: 'Break to 50 in under 3 seconds', category: 'movement', tier: 'bronze', icon: '💨', requirement: 'Sub-3s break logged', unlocked: false, progress: 0 },
  { id: 'move-iron-snake', name: 'Iron Snake', description: 'Survive 10 consecutive points in snake', category: 'movement', tier: 'silver', icon: '🐍', requirement: '10 snake survivals', unlocked: false, progress: 0 },
  { id: 'move-slider', name: 'Slider', description: 'Complete full movement drill series', category: 'movement', tier: 'gold', icon: '🏃', requirement: 'All movement drills', unlocked: false, progress: 0 },

  // Field IQ
  { id: 'iq-layout-scholar', name: 'Layout Scholar', description: 'Ace memorization quiz on 5 layouts', category: 'fieldIQ', tier: 'bronze', icon: '🗺️', requirement: '5 perfect quizzes', unlocked: false, progress: 0 },
  { id: 'iq-strategist', name: 'Strategist', description: 'Save 20 breakout plans', category: 'fieldIQ', tier: 'silver', icon: '🧠', requirement: '20 saved plans', unlocked: false, progress: 0 },
  { id: 'iq-film-student', name: 'Film Student', description: 'Review 10 hours of footage', category: 'fieldIQ', tier: 'gold', icon: '🎬', requirement: '10 hours watched', unlocked: false, progress: 0 },

  // Communication
  { id: 'comms-shot-caller', name: 'Shot Caller', description: 'Comms score above 80 for 5 sessions', category: 'communication', tier: 'bronze', icon: '📡', requirement: '5 sessions at 80+', unlocked: false, progress: 0 },
  { id: 'comms-captain', name: 'Team Captain', description: 'Team win rate up 20% when you lead comms', category: 'communication', tier: 'gold', icon: '🏆', requirement: '20% WR uplift', unlocked: false, progress: 0 },

  // Gun Skills
  { id: 'gun-lane-control', name: 'Lane Controller', description: '90%+ lane drill accuracy', category: 'gunSkills', tier: 'bronze', icon: '🎯', requirement: '90%+ lane accuracy', unlocked: false, progress: 0 },
  { id: 'gun-both-hands', name: 'Both Hands', description: 'Off-hand score within 10% of dominant', category: 'gunSkills', tier: 'silver', icon: '✋', requirement: 'Within 10% gap', unlocked: false, progress: 0 },

  // Fitness
  { id: 'fit-iron-legs', name: 'Iron Legs', description: 'Complete 30 sprint sessions', category: 'fitness', tier: 'bronze', icon: '🦵', requirement: '30 sprint sessions', unlocked: false, progress: 0 },
  { id: 'fit-marathon', name: 'Marathon', description: '50 hours of logged fitness', category: 'fitness', tier: 'silver', icon: '🏅', requirement: '50 hours total', unlocked: false, progress: 0 },
  { id: 'fit-no-rest', name: 'No Rest', description: '7-day workout streak', category: 'fitness', tier: 'gold', icon: '🔥', requirement: '7 consecutive days', unlocked: false, progress: 0 },

  // Meta/Social
  { id: 'meta-first-blood', name: 'First Blood', description: 'Log your first session', category: 'meta', tier: 'bronze', icon: '🩸', requirement: '1 session logged', unlocked: false, progress: 0 },
  { id: 'meta-season-warrior', name: 'Season Warrior', description: 'Log sessions for 12 consecutive weeks', category: 'meta', tier: 'gold', icon: '⚔️', requirement: '12 week streak', unlocked: false, progress: 0 },
  { id: 'meta-recruiter', name: 'Recruiter', description: 'Invite 3 teammates', category: 'meta', tier: 'bronze', icon: '🤝', requirement: '3 invites accepted', unlocked: false, progress: 0 },
  { id: 'meta-tournament-ready', name: 'Tournament Ready', description: 'All PPI axes above 50', category: 'meta', tier: 'gold', icon: '🏆', requirement: 'All axes 50+', unlocked: false, progress: 0 },
]
