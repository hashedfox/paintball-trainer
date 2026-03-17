/** Solo Drill Mode types */

import type { PPIAxis } from './ppi'

export type DrillType = 'snap-trainer' | 'layout-quiz' | 'fitness-workout' | 'comms-drill' | 'accuracy-drill'

export interface DrillDefinition {
  id: string
  name: string
  type: DrillType
  description: string
  ppiAxis: PPIAxis
  estimatedMinutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  icon: string
}

export interface DrillResult {
  id: string
  drillId: string
  date: string
  score: number
  personalBest: boolean
  duration: number  // seconds
  xpEarned: number
  ppiAxis: PPIAxis
  metrics: Record<string, number>  // drill-specific metrics
}

export interface DrillProgress {
  drillId: string
  completions: number
  bestScore: number
  lastCompleted: string
  averageScore: number
}

export const DRILL_LIBRARY: DrillDefinition[] = [
  // Snap Shooting drills
  {
    id: 'snap-basic',
    name: 'Quick Snap',
    type: 'snap-trainer',
    description: 'Basic snap shooting drill — expose, aim, retract. Build speed and accuracy.',
    ppiAxis: 'snapShooting',
    estimatedMinutes: 5,
    difficulty: 'easy',
    icon: '🎯',
  },
  {
    id: 'snap-offhand',
    name: 'Off-Hand Snaps',
    type: 'snap-trainer',
    description: 'Practice snap shooting with your non-dominant hand. Critical for competitive play.',
    ppiAxis: 'snapShooting',
    estimatedMinutes: 8,
    difficulty: 'medium',
    icon: '🔄',
  },
  {
    id: 'snap-speed',
    name: 'Speed Snaps',
    type: 'snap-trainer',
    description: 'Maximum speed snap drill — sub-200ms target expose time.',
    ppiAxis: 'snapShooting',
    estimatedMinutes: 5,
    difficulty: 'hard',
    icon: '⚡',
  },
  // Layout drills
  {
    id: 'layout-basic',
    name: 'Layout Memory',
    type: 'layout-quiz',
    description: 'Memorize bunker positions on the current NXL layout. Flash and recall.',
    ppiAxis: 'fieldIQ',
    estimatedMinutes: 5,
    difficulty: 'easy',
    icon: '🧠',
  },
  {
    id: 'layout-advanced',
    name: 'Full Layout Recall',
    type: 'layout-quiz',
    description: 'Complete layout memorization with all bunkers and lanes. Time-limited.',
    ppiAxis: 'fieldIQ',
    estimatedMinutes: 8,
    difficulty: 'hard',
    icon: '🗺️',
  },
  // Fitness drills
  {
    id: 'fitness-sprint',
    name: 'Breakout Sprints',
    type: 'fitness-workout',
    description: 'Sprint intervals simulating breakout runs. 10-15 second bursts.',
    ppiAxis: 'fitness',
    estimatedMinutes: 15,
    difficulty: 'medium',
    icon: '🏃',
  },
  {
    id: 'fitness-agility',
    name: 'Agility Ladder',
    type: 'fitness-workout',
    description: 'Lateral movement drills for bunker transitions. Improve slide technique.',
    ppiAxis: 'fitness',
    estimatedMinutes: 12,
    difficulty: 'medium',
    icon: '🔥',
  },
  {
    id: 'fitness-hiit',
    name: 'Paintball HIIT',
    type: 'fitness-workout',
    description: 'Full-body high-intensity workout designed for paintball endurance.',
    ppiAxis: 'fitness',
    estimatedMinutes: 20,
    difficulty: 'hard',
    icon: '💪',
  },
  // Communication drills
  {
    id: 'comms-basic',
    name: 'Call-Out Basics',
    type: 'comms-drill',
    description: 'Practice basic position call-outs. Listen to scenarios and respond correctly.',
    ppiAxis: 'communication',
    estimatedMinutes: 8,
    difficulty: 'easy',
    icon: '📡',
  },
  {
    id: 'comms-rapid',
    name: 'Rapid Call-Outs',
    type: 'comms-drill',
    description: 'Multi-threat scenario drill. React to multiple positions simultaneously.',
    ppiAxis: 'communication',
    estimatedMinutes: 10,
    difficulty: 'hard',
    icon: '🗣️',
  },
  // Gun skills
  {
    id: 'accuracy-lanes',
    name: 'Lane Accuracy',
    type: 'accuracy-drill',
    description: 'Practice shooting consistent lanes between bunkers. Track accuracy %.',
    ppiAxis: 'gunSkills',
    estimatedMinutes: 8,
    difficulty: 'medium',
    icon: '🎯',
  },
  {
    id: 'accuracy-offhand',
    name: 'Off-Hand Accuracy',
    type: 'accuracy-drill',
    description: 'Accuracy drill focusing on non-dominant hand shooting proficiency.',
    ppiAxis: 'gunSkills',
    estimatedMinutes: 10,
    difficulty: 'hard',
    icon: '🔫',
  },
]

export function getDrillsForAxis(axis: PPIAxis): DrillDefinition[] {
  return DRILL_LIBRARY.filter(d => d.ppiAxis === axis)
}

export function getTodaysDrill(focusAxis: PPIAxis, completedDrillIds: string[]): DrillDefinition | null {
  const axisDrills = getDrillsForAxis(focusAxis)
  const uncompleted = axisDrills.filter(d => !completedDrillIds.includes(d.id))
  return uncompleted[0] || axisDrills[0] || null
}
