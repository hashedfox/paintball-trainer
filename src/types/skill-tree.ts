/** Position-based skill trees — RPG-style progression paths per position */

import type { PPIAxis } from './ppi'
import type { PositionRole } from './player'

export type SkillTier = 1 | 2 | 3 | 4

export const SKILL_TIER_LABELS: Record<SkillTier, string> = {
  1: 'Foundations',
  2: 'Core Competence',
  3: 'Advanced',
  4: 'Elite',
}

export interface SkillTreeNode {
  id: string
  name: string
  description: string
  tier: SkillTier
  ppiAxis: PPIAxis
  estimatedMinutes: number
  prerequisiteIds: string[]  // node IDs that must be completed first
  icon: string
}

export interface SkillTree {
  positionRole: PositionRole
  label: string
  nodes: SkillTreeNode[]
}

// ─── Snake Player Skill Tree ─────────────────────────────────────────────────

const SNAKE_TREE: SkillTree = {
  positionRole: 'snake',
  label: 'Snake Player',
  nodes: [
    // Tier 1: Foundations
    { id: 'sn-t1-snap', name: 'Low-Profile Snap Shooting', description: 'Practice snap shots from prone and kneeling positions behind serpentine bunkers.', tier: 1, ppiAxis: 'snapShooting', estimatedMinutes: 8, prerequisiteIds: [], icon: '🎯' },
    { id: 'sn-t1-breakout', name: 'Breakout Dive to Snake-1', description: 'Drill the breakout run — explosive start, dive technique, safe landing behind snake 1.', tier: 1, ppiAxis: 'movement', estimatedMinutes: 10, prerequisiteIds: [], icon: '💨' },
    { id: 'sn-t1-comms', name: '"I\'m Alive" Communication', description: 'Practice basic alive/position calls from the snake side. Build the habit of constant updates.', tier: 1, ppiAxis: 'communication', estimatedMinutes: 5, prerequisiteIds: [], icon: '📡' },

    // Tier 2: Core Competence
    { id: 'sn-t2-crawl', name: 'Snake Crawl Speed Drill', description: 'Time your crawl transitions from snake 1 to snake 2 to 50. Minimize exposure time.', tier: 2, ppiAxis: 'movement', estimatedMinutes: 12, prerequisiteIds: ['sn-t1-breakout'], icon: '🐍' },
    { id: 'sn-t2-mirror', name: 'Mirror Gunfight Survival', description: 'Left/right hand swap drills. Simulate mirror battles from both sides of the serpentine.', tier: 2, ppiAxis: 'snapShooting', estimatedMinutes: 10, prerequisiteIds: ['sn-t1-snap'], icon: '🔄' },
    { id: 'sn-t2-bump', name: 'Bump Timing Decision Drill', description: 'Scenario-based drill: when to advance (bump) vs hold. Reads based on opponent count and positions.', tier: 2, ppiAxis: 'fieldIQ', estimatedMinutes: 8, prerequisiteIds: ['sn-t1-comms'], icon: '🧠' },

    // Tier 3: Advanced
    { id: 'sn-t3-wrap', name: 'Wrap-Around Angle Training', description: 'Practice elimination angles from wrap-around positions. Tight angles at speed.', tier: 3, ppiAxis: 'gunSkills', estimatedMinutes: 12, prerequisiteIds: ['sn-t2-mirror'], icon: '🎯' },
    { id: 'sn-t3-1v1', name: '1v1 Closeout Mental Rehearsal', description: 'Visualize and drill 1v1 closeout scenarios. Decision-making under pressure.', tier: 3, ppiAxis: 'mentalGame', estimatedMinutes: 10, prerequisiteIds: ['sn-t2-bump'], icon: '🧘' },
    { id: 'sn-t3-crossfield', name: 'Cross-Field Comms Under Fire', description: 'Practice relaying info across the field while actively being shot at. Split attention.', tier: 3, ppiAxis: 'communication', estimatedMinutes: 8, prerequisiteIds: ['sn-t2-crawl'], icon: '📡' },

    // Tier 4: Elite
    { id: 'sn-t4-multikill', name: 'Multi-Kill Visualization', description: 'Visualize and plan multi-elimination scenarios from deep snake positions.', tier: 4, ppiAxis: 'mentalGame', estimatedMinutes: 10, prerequisiteIds: ['sn-t3-1v1', 'sn-t3-wrap'], icon: '🔥' },
    { id: 'sn-t4-adverse', name: 'Adverse Numbers (1v2, 1v3)', description: 'Decision drills for playing outnumbered. When to play time vs when to attack.', tier: 4, ppiAxis: 'fieldIQ', estimatedMinutes: 12, prerequisiteIds: ['sn-t3-1v1'], icon: '⚡' },
    { id: 'sn-t4-pressure', name: 'Tournament-Pressure Snaps', description: 'Timed, scored snap shooting drill with stress simulation. Crowd noise, time pressure.', tier: 4, ppiAxis: 'snapShooting', estimatedMinutes: 8, prerequisiteIds: ['sn-t3-wrap', 'sn-t3-crossfield'], icon: '🏆' },
  ],
}

// ─── Dorito Player Skill Tree ────────────────────────────────────────────────

const DORITO_TREE: SkillTree = {
  positionRole: 'dorito',
  label: 'Dorito Player',
  nodes: [
    // Tier 1
    { id: 'do-t1-snap', name: 'Pyramid Edge Snaps', description: 'Standing and kneeling snap shots from dorito edges. Sharp angle practice at 45 degrees.', tier: 1, ppiAxis: 'snapShooting', estimatedMinutes: 8, prerequisiteIds: [], icon: '🎯' },
    { id: 'do-t1-breakout', name: 'Breakout to Dorito-1', description: 'Explosive breakout run to primary dorito bunker. Practice slides and safe positioning.', tier: 1, ppiAxis: 'movement', estimatedMinutes: 10, prerequisiteIds: [], icon: '💨' },
    { id: 'do-t1-comms', name: 'Cross-Side Info Relay', description: 'Practice calling out opponent positions on the opposite side of the field.', tier: 1, ppiAxis: 'communication', estimatedMinutes: 5, prerequisiteIds: [], icon: '📡' },

    // Tier 2
    { id: 'do-t2-lateral', name: 'Lateral Transition Drill', description: 'Practice moving between dorito bunkers laterally. Quick, low-profile transitions.', tier: 2, ppiAxis: 'movement', estimatedMinutes: 10, prerequisiteIds: ['do-t1-breakout'], icon: '↔️' },
    { id: 'do-t2-mirror', name: 'Mirror Gunfight Simulation', description: 'Simulate mirror position battles. Practice angles, timing, and patience.', tier: 2, ppiAxis: 'snapShooting', estimatedMinutes: 10, prerequisiteIds: ['do-t1-snap'], icon: '🔄' },
    { id: 'do-t2-patience', name: 'Patience & Timing Drill', description: 'Decision drill: when to engage vs when to wait. Dorito patience is critical.', tier: 2, ppiAxis: 'fieldIQ', estimatedMinutes: 8, prerequisiteIds: ['do-t1-comms'], icon: '⏱️' },

    // Tier 3
    { id: 'do-t3-lanes', name: 'Sustained Lane Shooting', description: 'Practice holding lanes from dorito bunkers. Sustained accuracy under volume.', tier: 3, ppiAxis: 'gunSkills', estimatedMinutes: 12, prerequisiteIds: ['do-t2-mirror'], icon: '🎯' },
    { id: 'do-t3-mental', name: 'Mirror Battle Mental Game', description: 'Mental rehearsal for extended mirror gunfights. Stay composed through long exchanges.', tier: 3, ppiAxis: 'mentalGame', estimatedMinutes: 10, prerequisiteIds: ['do-t2-patience'], icon: '🧘' },
    { id: 'do-t3-aggression', name: 'Aggressive Dorito Push', description: 'When and how to push from dorito. Timing, communication, and execution.', tier: 3, ppiAxis: 'movement', estimatedMinutes: 10, prerequisiteIds: ['do-t2-lateral'], icon: '⚡' },

    // Tier 4
    { id: 'do-t4-crossfield', name: 'Cross-Field Domination', description: 'Advanced angles and lane control from deep dorito to affect the entire field.', tier: 4, ppiAxis: 'gunSkills', estimatedMinutes: 12, prerequisiteIds: ['do-t3-lanes', 'do-t3-aggression'], icon: '🔥' },
    { id: 'do-t4-adverse', name: 'Dorito Adverse Numbers', description: 'Playing 1v2 from dorito positions. Use angles and patience to outplay.', tier: 4, ppiAxis: 'fieldIQ', estimatedMinutes: 10, prerequisiteIds: ['do-t3-mental'], icon: '⚡' },
    { id: 'do-t4-pressure', name: 'Tournament Dorito Drill', description: 'Full-pressure dorito play simulation with time constraints and scoring.', tier: 4, ppiAxis: 'snapShooting', estimatedMinutes: 8, prerequisiteIds: ['do-t3-lanes', 'do-t3-mental'], icon: '🏆' },
  ],
}

// ─── Back Center Skill Tree ──────────────────────────────────────────────────

const BACK_CENTER_TREE: SkillTree = {
  positionRole: 'back-center',
  label: 'Back Center',
  nodes: [
    // Tier 1
    { id: 'bc-t1-lanes', name: 'Lane-Holding Accuracy', description: 'Drill shooting tight lanes between bunkers. Consistent accuracy over sustained bursts.', tier: 1, ppiAxis: 'gunSkills', estimatedMinutes: 10, prerequisiteIds: [], icon: '🎯' },
    { id: 'bc-t1-break', name: 'Break Shooting: Runners', description: 'Practice hitting runners off the starting box. Timing and lead shooting.', tier: 1, ppiAxis: 'snapShooting', estimatedMinutes: 8, prerequisiteIds: [], icon: '💥' },
    { id: 'bc-t1-vocab', name: 'Call-Out Vocabulary', description: 'Learn and practice the standard call-out vocabulary. Bunker names, directions, actions.', tier: 1, ppiAxis: 'communication', estimatedMinutes: 5, prerequisiteIds: [], icon: '📡' },

    // Tier 2
    { id: 'bc-t2-duallane', name: 'Dual-Lane Switching', description: 'Practice rapid lane switching between two targets. Speed and accuracy under pressure.', tier: 2, ppiAxis: 'gunSkills', estimatedMinutes: 10, prerequisiteIds: ['bc-t1-lanes'], icon: '↔️' },
    { id: 'bc-t2-awareness', name: 'Whole-Field Awareness Quiz', description: 'Scenario quiz: where is every player on the field? Build whole-field mental model.', tier: 2, ppiAxis: 'fieldIQ', estimatedMinutes: 8, prerequisiteIds: ['bc-t1-vocab'], icon: '🧠' },
    { id: 'bc-t2-traffic', name: 'Traffic Control Sequences', description: 'Practice directing team movement. Call bumps, fills, and rotations in sequence.', tier: 2, ppiAxis: 'communication', estimatedMinutes: 10, prerequisiteIds: ['bc-t1-vocab'], icon: '🗣️' },

    // Tier 3
    { id: 'bc-t3-relay', name: 'Cross-Field Info Relay', description: 'Relay opponent positions and team status across the field. Timing and clarity.', tier: 3, ppiAxis: 'communication', estimatedMinutes: 10, prerequisiteIds: ['bc-t2-traffic'], icon: '📡' },
    { id: 'bc-t3-fill', name: 'Fill/Insert Decision Tree', description: 'When to leave back center to fill a gap. Decision-making based on player count.', tier: 3, ppiAxis: 'fieldIQ', estimatedMinutes: 10, prerequisiteIds: ['bc-t2-awareness'], icon: '🧠' },
    { id: 'bc-t3-paint', name: 'Paint Economy Optimization', description: 'Efficiency drill: maintain lane control while conserving paint. Burst vs sustained.', tier: 3, ppiAxis: 'gunSkills', estimatedMinutes: 8, prerequisiteIds: ['bc-t2-duallane'], icon: '💰' },

    // Tier 4
    { id: 'bc-t4-closing', name: 'Game Closing (3v2, 2v1)', description: 'Scenario management for closing out games with number advantage.', tier: 4, ppiAxis: 'fieldIQ', estimatedMinutes: 12, prerequisiteIds: ['bc-t3-fill', 'bc-t3-relay'], icon: '🏆' },
    { id: 'bc-t4-tactical', name: 'Real-Time Tactical Direction', description: 'Simulate calling plays in real-time. Direct team movements based on game state.', tier: 4, ppiAxis: 'communication', estimatedMinutes: 12, prerequisiteIds: ['bc-t3-relay'], icon: '📋' },
    { id: 'bc-t4-adverse', name: 'Defensive Adverse Numbers', description: 'Defensive play calls and lane control when outnumbered. Keep opponents pinned.', tier: 4, ppiAxis: 'mentalGame', estimatedMinutes: 10, prerequisiteIds: ['bc-t3-fill', 'bc-t3-paint'], icon: '🛡️' },
  ],
}

// ─── Mid/Insert Skill Tree ───────────────────────────────────────────────────

const MID_INSERT_TREE: SkillTree = {
  positionRole: 'mid-insert',
  label: 'Mid / Insert',
  nodes: [
    // Tier 1
    { id: 'mi-t1-snap', name: 'Versatile Snap Shooting', description: 'Practice snaps from multiple bunker types. Adapt shooting to any position.', tier: 1, ppiAxis: 'snapShooting', estimatedMinutes: 8, prerequisiteIds: [], icon: '🎯' },
    { id: 'mi-t1-sprint', name: 'Sprint-to-Fill Conditioning', description: 'Explosive sprinting drill simulating mid-game fills to open positions.', tier: 1, ppiAxis: 'fitness', estimatedMinutes: 12, prerequisiteIds: [], icon: '🏃' },
    { id: 'mi-t1-relay', name: 'Both-Sides Info Relay', description: 'Practice receiving info from both sides and relaying between snake and dorito.', tier: 1, ppiAxis: 'communication', estimatedMinutes: 6, prerequisiteIds: [], icon: '📡' },

    // Tier 2
    { id: 'mi-t2-role', name: 'Role Recognition Drill', description: 'Scenario drill: identify what role is needed based on current game state.', tier: 2, ppiAxis: 'fieldIQ', estimatedMinutes: 8, prerequisiteIds: ['mi-t1-relay'], icon: '🧠' },
    { id: 'mi-t2-rungun', name: 'Run-and-Gun Accuracy', description: 'Shooting while moving. Maintain accuracy during transitions and fills.', tier: 2, ppiAxis: 'gunSkills', estimatedMinutes: 10, prerequisiteIds: ['mi-t1-snap'], icon: '🔫' },
    { id: 'mi-t2-timing', name: 'Insert Timing Drill', description: 'Practice the timing of inserting into gaps. Too early vs too late recognition.', tier: 2, ppiAxis: 'movement', estimatedMinutes: 10, prerequisiteIds: ['mi-t1-sprint'], icon: '⏱️' },

    // Tier 3
    { id: 'mi-t3-adapt', name: 'Position Adaptation', description: 'Drill playing snake, dorito, and center in rapid succession. Build versatility.', tier: 3, ppiAxis: 'fieldIQ', estimatedMinutes: 12, prerequisiteIds: ['mi-t2-role', 'mi-t2-timing'], icon: '🔄' },
    { id: 'mi-t3-pressure', name: 'Pressure-Decision Training', description: 'Make correct fill/push decisions under simulated game pressure and time constraints.', tier: 3, ppiAxis: 'mentalGame', estimatedMinutes: 10, prerequisiteIds: ['mi-t2-role'], icon: '🧘' },
    { id: 'mi-t3-endurance', name: 'Multi-Point Endurance', description: 'Sustained high-intensity drill across multiple simulated points. Recovery between.', tier: 3, ppiAxis: 'fitness', estimatedMinutes: 15, prerequisiteIds: ['mi-t2-timing'], icon: '💪' },

    // Tier 4
    { id: 'mi-t4-quarterback', name: 'Secondary Quarterback', description: 'Take over game direction when the back center is eliminated. Full-field management.', tier: 4, ppiAxis: 'communication', estimatedMinutes: 12, prerequisiteIds: ['mi-t3-adapt', 'mi-t3-pressure'], icon: '📋' },
    { id: 'mi-t4-clutch', name: 'Clutch Insert Plays', description: 'Practice game-winning inserts. Sprint, eliminate, survive under maximum pressure.', tier: 4, ppiAxis: 'mentalGame', estimatedMinutes: 10, prerequisiteIds: ['mi-t3-pressure'], icon: '🏆' },
    { id: 'mi-t4-allround', name: 'All-Position Mastery', description: 'Demonstration drill: play all 5 positions at a competent level in quick succession.', tier: 4, ppiAxis: 'fieldIQ', estimatedMinutes: 15, prerequisiteIds: ['mi-t3-adapt', 'mi-t3-endurance'], icon: '⭐' },
  ],
}

// ─── Flex Skill Tree (combination) ───────────────────────────────────────────

const FLEX_TREE: SkillTree = {
  positionRole: 'flex',
  label: 'Flex Player',
  nodes: [
    // Tier 1
    { id: 'fl-t1-snap', name: 'Universal Snap Shooting', description: 'Snap shots from all bunker types. Adapt to any position on the field.', tier: 1, ppiAxis: 'snapShooting', estimatedMinutes: 10, prerequisiteIds: [], icon: '🎯' },
    { id: 'fl-t1-movement', name: 'All-Position Movement', description: 'Practice slides, dives, crawls, and sprints for every position type.', tier: 1, ppiAxis: 'movement', estimatedMinutes: 12, prerequisiteIds: [], icon: '💨' },
    { id: 'fl-t1-comms', name: 'Full-Field Communication', description: 'Learn call-outs for every position. Practice relaying from any spot on the field.', tier: 1, ppiAxis: 'communication', estimatedMinutes: 8, prerequisiteIds: [], icon: '📡' },

    // Tier 2
    { id: 'fl-t2-iq', name: 'Role Switching IQ', description: 'Read game state and identify which role needs filling. Drill rapid decision-making.', tier: 2, ppiAxis: 'fieldIQ', estimatedMinutes: 10, prerequisiteIds: ['fl-t1-comms'], icon: '🧠' },
    { id: 'fl-t2-gunplay', name: 'Adaptive Gun Play', description: 'Switch between lane shooting, snap battles, and run-and-gun mid-drill.', tier: 2, ppiAxis: 'gunSkills', estimatedMinutes: 10, prerequisiteIds: ['fl-t1-snap'], icon: '🔫' },
    { id: 'fl-t2-fitness', name: 'Flex Fitness Circuit', description: 'Mixed conditioning: sprints, agility, endurance. Built for the flex role.', tier: 2, ppiAxis: 'fitness', estimatedMinutes: 15, prerequisiteIds: ['fl-t1-movement'], icon: '💪' },

    // Tier 3
    { id: 'fl-t3-tactical', name: 'Tactical Versatility', description: 'Practice executing different team plans from different positions each time.', tier: 3, ppiAxis: 'fieldIQ', estimatedMinutes: 12, prerequisiteIds: ['fl-t2-iq'], icon: '📋' },
    { id: 'fl-t3-mental', name: 'Composure Under Chaos', description: 'Mental training for rapid position changes and unexpected game situations.', tier: 3, ppiAxis: 'mentalGame', estimatedMinutes: 10, prerequisiteIds: ['fl-t2-iq'], icon: '🧘' },
    { id: 'fl-t3-conditioning', name: 'Tournament Day Conditioning', description: 'Full-day simulation: high-rep drills simulating tournament pace and recovery.', tier: 3, ppiAxis: 'fitness', estimatedMinutes: 20, prerequisiteIds: ['fl-t2-fitness'], icon: '🏋️' },

    // Tier 4
    { id: 'fl-t4-clutch', name: 'Universal Clutch Player', description: 'Play every position in adverse number situations. The ultimate flex player drill.', tier: 4, ppiAxis: 'mentalGame', estimatedMinutes: 15, prerequisiteIds: ['fl-t3-tactical', 'fl-t3-mental'], icon: '🏆' },
    { id: 'fl-t4-captain', name: 'On-Field Captain', description: 'Direct team play from any position on the field. Full tactical command.', tier: 4, ppiAxis: 'communication', estimatedMinutes: 12, prerequisiteIds: ['fl-t3-tactical'], icon: '⭐' },
    { id: 'fl-t4-elite', name: 'Elite Flex Mastery', description: 'Score at Advanced tier on all position skill trees. The complete player.', tier: 4, ppiAxis: 'fieldIQ', estimatedMinutes: 15, prerequisiteIds: ['fl-t3-mental', 'fl-t3-conditioning'], icon: '🔥' },
  ],
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const SKILL_TREES: Record<PositionRole, SkillTree> = {
  snake: SNAKE_TREE,
  dorito: DORITO_TREE,
  'back-center': BACK_CENTER_TREE,
  'mid-insert': MID_INSERT_TREE,
  flex: FLEX_TREE,
}

export function getSkillTree(role: PositionRole): SkillTree {
  return SKILL_TREES[role]
}

export function isNodeUnlocked(nodeId: string, completedNodeIds: string[], tree: SkillTree): boolean {
  const node = tree.nodes.find(n => n.id === nodeId)
  if (!node) return false
  if (node.prerequisiteIds.length === 0) return true
  return node.prerequisiteIds.every(prereq => completedNodeIds.includes(prereq))
}

export function getNextUnlockedNode(completedNodeIds: string[], tree: SkillTree): SkillTreeNode | null {
  for (const node of tree.nodes) {
    if (completedNodeIds.includes(node.id)) continue
    if (isNodeUnlocked(node.id, completedNodeIds, tree)) return node
  }
  return null
}

export function getTierProgress(tier: SkillTier, completedNodeIds: string[], tree: SkillTree): { completed: number; total: number } {
  const tierNodes = tree.nodes.filter(n => n.tier === tier)
  const completed = tierNodes.filter(n => completedNodeIds.includes(n.id)).length
  return { completed, total: tierNodes.length }
}
