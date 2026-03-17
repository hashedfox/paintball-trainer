export type ChallengeType = 'daily' | 'weekly' | 'milestone'
export type ChallengeCategory = 'drill' | 'game' | 'ppi' | 'community' | 'training'

export interface Challenge {
  id: string
  type: ChallengeType
  category: ChallengeCategory
  title: string
  description: string
  xpReward: number
  coinReward: number
  requirement: number
  progress: number
  completed: boolean
  expiresAt?: string
  icon: string
  ppiImpact?: string // which PPI metric this improves
}

export interface DailyLogin {
  date: string
  streak: number
  xpEarned: number
}

export interface MarketplaceItem {
  id: string
  name: string
  description: string
  category: 'badge' | 'tag' | 'equipment' | 'skin'
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  imageKey: string
  owned: boolean
}

export interface ChallengesState {
  activeChallenges: Challenge[]
  completedChallenges: string[]
  xp: number
  level: number
  coins: number
  loginStreak: number
  lastLoginDate: string
  ownedItems: string[]
}

export function createDefaultChallengesState(): ChallengesState {
  return {
    activeChallenges: getDefaultChallenges(),
    completedChallenges: [],
    xp: 0,
    level: 1,
    coins: 100,
    loginStreak: 0,
    lastLoginDate: '',
    ownedItems: [],
  }
}

export function getDefaultChallenges(): Challenge[] {
  return [
    {
      id: 'daily-snap-1',
      type: 'daily',
      category: 'drill',
      title: 'Snap Shot Practice',
      description: 'Complete 50 snap shots at home (mirror drill or wall target)',
      xpReward: 25,
      coinReward: 10,
      requirement: 50,
      progress: 0,
      completed: false,
      icon: '🎯',
      ppiImpact: 'killsPerPoint',
    },
    {
      id: 'daily-comms-1',
      type: 'daily',
      category: 'drill',
      title: 'Communication Drill',
      description: 'Practice 10 minutes of paintball callout vocabulary',
      xpReward: 20,
      coinReward: 8,
      requirement: 10,
      progress: 0,
      completed: false,
      icon: '📡',
      ppiImpact: 'comms',
    },
    {
      id: 'daily-log-1',
      type: 'daily',
      category: 'ppi',
      title: 'Log Your Stats',
      description: 'Record at least 1 point of game data in the PPI tracker',
      xpReward: 15,
      coinReward: 5,
      requirement: 1,
      progress: 0,
      completed: false,
      icon: '📊',
    },
    {
      id: 'weekly-games-1',
      type: 'weekly',
      category: 'game',
      title: 'Weekend Warrior',
      description: 'Record 5 or more game points this week',
      xpReward: 100,
      coinReward: 50,
      requirement: 5,
      progress: 0,
      completed: false,
      icon: '⚔️',
    },
    {
      id: 'weekly-movement-1',
      type: 'weekly',
      category: 'drill',
      title: 'Movement Master',
      description: 'Complete 3 movement/agility drills this week',
      xpReward: 75,
      coinReward: 35,
      requirement: 3,
      progress: 0,
      completed: false,
      icon: '💨',
      ppiImpact: 'survival',
    },
    {
      id: 'weekly-study-1',
      type: 'weekly',
      category: 'training',
      title: 'Film Study',
      description: 'Watch 2 pro match videos and analyze plays',
      xpReward: 60,
      coinReward: 25,
      requirement: 2,
      progress: 0,
      completed: false,
      icon: '🎬',
      ppiImpact: 'otb',
    },
    {
      id: 'milestone-ppi-50',
      type: 'milestone',
      category: 'ppi',
      title: 'Rising Star',
      description: 'Reach a PPI score of 50 or higher',
      xpReward: 250,
      coinReward: 100,
      requirement: 50,
      progress: 0,
      completed: false,
      icon: '⭐',
    },
    {
      id: 'milestone-points-25',
      type: 'milestone',
      category: 'game',
      title: 'Data Driven',
      description: 'Record 25 total game points',
      xpReward: 200,
      coinReward: 75,
      requirement: 25,
      progress: 0,
      completed: false,
      icon: '📈',
    },
  ]
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export function getLevelFromXp(xp: number): number {
  let level = 1
  let needed = 100
  let total = 0
  while (total + needed <= xp) {
    total += needed
    level++
    needed = Math.floor(100 * Math.pow(1.5, level - 1))
  }
  return level
}
