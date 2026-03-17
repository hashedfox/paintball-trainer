/** Field Layout & Breakout Planner types */

export interface Bunker {
  id: string
  name: string
  shortName: string
  x: number  // 0-100 percentage position
  y: number  // 0-100 percentage position
  type: 'snake' | 'dorito' | 'brick' | 'cake' | 'temple' | 'can' | 'tall-cake' | 'mini' | 'pin'
  side: 'snake' | 'dorito' | 'center'
}

export interface FieldLayout {
  id: string
  name: string
  season: string
  event: string
  bunkers: Bunker[]
  imageUrl?: string
}

export interface BreakoutArrow {
  playerId: number  // 1-5
  from: { x: number; y: number }
  to: { x: number; y: number }
  type: 'primary' | 'secondary' | 'lane'  // solid, dashed, dotted
}

export interface BreakoutPlan {
  id: string
  name: string
  layoutId: string
  arrows: BreakoutArrow[]
  notes: string
  createdAt: string
}

export interface ScoutingNote {
  id: string
  teamName: string
  notes: string
  lastUpdated: string
}

// Standard NXL-style field layout with common bunker positions
export const DEFAULT_FIELD_LAYOUT: FieldLayout = {
  id: 'nxl-2026-1',
  name: 'NXL 2026 Layout 1',
  season: '2026',
  event: 'Dallas Open',
  bunkers: [
    // Snake side (left)
    { id: 's1', name: 'Snake 1', shortName: 'S1', x: 15, y: 30, type: 'snake', side: 'snake' },
    { id: 's2', name: 'Snake 2', shortName: 'S2', x: 25, y: 22, type: 'snake', side: 'snake' },
    { id: 's3', name: 'Snake 50', shortName: 'S50', x: 38, y: 18, type: 'snake', side: 'snake' },
    { id: 'sc', name: 'Snake Corner', shortName: 'SC', x: 8, y: 42, type: 'can', side: 'snake' },

    // Dorito side (right)
    { id: 'd1', name: 'Dorito 1', shortName: 'D1', x: 85, y: 30, type: 'dorito', side: 'dorito' },
    { id: 'd2', name: 'Dorito 2', shortName: 'D2', x: 75, y: 22, type: 'dorito', side: 'dorito' },
    { id: 'd3', name: 'Dorito 50', shortName: 'D50', x: 62, y: 18, type: 'dorito', side: 'dorito' },
    { id: 'dc', name: 'Dorito Corner', shortName: 'DC', x: 92, y: 42, type: 'can', side: 'dorito' },

    // Center
    { id: 'g', name: 'God / Brick', shortName: 'G', x: 50, y: 25, type: 'brick', side: 'center' },
    { id: 'mt', name: 'Mid Temple', shortName: 'MT', x: 50, y: 38, type: 'temple', side: 'center' },
    { id: 'ck', name: 'Cake', shortName: 'CK', x: 40, y: 35, type: 'cake', side: 'center' },
    { id: 'ck2', name: 'Cake 2', shortName: 'CK2', x: 60, y: 35, type: 'cake', side: 'center' },

    // Back bunkers (near spawn)
    { id: 'bs', name: 'Back Snake', shortName: 'BS', x: 20, y: 55, type: 'tall-cake', side: 'snake' },
    { id: 'bd', name: 'Back Dorito', shortName: 'BD', x: 80, y: 55, type: 'tall-cake', side: 'dorito' },
    { id: 'bc', name: 'Back Center', shortName: 'BC', x: 50, y: 55, type: 'brick', side: 'center' },

    // Mini bunkers
    { id: 'ms', name: 'Mini Snake', shortName: 'MS', x: 30, y: 42, type: 'mini', side: 'snake' },
    { id: 'md', name: 'Mini Dorito', shortName: 'MD', x: 70, y: 42, type: 'mini', side: 'dorito' },
  ],
}

export const PLAYER_COLORS = ['#58A6FF', '#39D353', '#E3B341', '#F85149', '#A371F7']
