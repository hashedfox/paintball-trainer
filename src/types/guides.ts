import type { Position } from './player'

export type GuideCategory = 'fundamentals' | 'position' | 'plays' | 'field-layout' | 'mental' | 'fitness' | 'equipment'

export interface Guide {
  id: string
  title: string
  category: GuideCategory
  positions?: Position[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  summary: string
  sections: GuideSection[]
  videoUrl?: string
  tags: string[]
}

export interface GuideSection {
  heading: string
  content: string
  tips?: string[]
}

export function getGuides(): Guide[] {
  return [
    {
      id: 'g-breakout-101',
      title: 'Breakout Execution 101',
      category: 'fundamentals',
      difficulty: 'beginner',
      estimatedMinutes: 8,
      summary: 'Master the opening seconds of every point — off-the-break shots, lanes, and positioning.',
      sections: [
        { heading: 'What is a Breakout?', content: 'The breakout is the first 3-5 seconds after the horn. Every player sprints to their assigned bunker while shooting lanes to eliminate opponents. A strong breakout sets the tempo for the entire point.' },
        { heading: 'Pre-Game Prep', content: 'Before the horn: know your assigned bunker, your primary lane, and your secondary option if the primary is blocked. Visualize the run.', tips: ['Always have a Plan B bunker', 'Communicate lane assignments before the horn'] },
        { heading: 'Lane Shooting', content: 'Shoot your lane WHILE running. Don\'t wait until you\'re set. The goal is to force opponents to slide or take a hit. Aim for the gap between bunkers where runners must cross.' },
        { heading: 'Off-the-Break (OTB) Survival', content: 'Survival rate is one of the most important stats. If you die on the breakout, your team plays 4v5. Run tight lines, stay low, and shoot lanes.', tips: ['Practice your specific run at home (dry fire)', 'Film yourself to check body exposure'] },
      ],
      tags: ['breakout', 'otb', 'lanes', 'survival'],
    },
    {
      id: 'g-snake-guide',
      title: 'Snake Side Mastery',
      category: 'position',
      positions: ['snake1', 'snake2'],
      difficulty: 'intermediate',
      estimatedMinutes: 12,
      summary: 'Deep dive into snake-side play — crawling, wrapping, and controlling the snake wire.',
      sections: [
        { heading: 'Snake 1 Role', content: 'Snake 1 is the primary aggressive player on the snake side. You push forward when the team has numbers advantage. Your job: create angles, wrap shots, and force opponents off their bunkers.' },
        { heading: 'Snake 2 / Support', content: 'Snake 2 holds the tape-side lane and supports Snake 1 pushes. You\'re the safety net — if Snake 1 goes down, you maintain snake-side control.' },
        { heading: 'Crawling Technique', content: 'Stay as flat as possible. Use elbows and knees, not hands and feet. Keep your marker up and ready. Move between shots from the opposition.', tips: ['Practice crawling at home on carpet/grass', 'Time your moves between opponent shots'] },
        { heading: 'Wrapping', content: 'Wrapping means leaning out the back of a bunker to shoot behind the opponent\'s cover. This is a high-risk, high-reward play. Only wrap when you have a clear shot or your team has a numbers advantage.' },
      ],
      videoUrl: 'https://www.youtube.com/results?search_query=paintball+snake+position+guide',
      tags: ['snake', 'position', 'crawling', 'wrapping'],
    },
    {
      id: 'g-doritto-guide',
      title: 'Doritto Side Control',
      category: 'position',
      positions: ['doritto1', 'doritto2'],
      difficulty: 'intermediate',
      estimatedMinutes: 10,
      summary: 'How to dominate the doritto side — cross-field lanes, bump patterns, and bunker control.',
      sections: [
        { heading: 'Doritto 1 Role', content: 'D1 is the primary doritto-side player. You control cross-field lanes, suppress the snake side, and bump forward when your team has the advantage.' },
        { heading: 'Lane Discipline', content: 'Doritto players are lane machines. Your job is to keep a constant stream of paint on key bunkers, preventing opponents from moving or shooting out. Consistent, accurate lanes win points.' },
        { heading: 'Cross-Field Communication', content: 'D-side players must communicate with snake-side. Call out opponent positions, movements, and when you\'re shooting lanes so teammates can move.', tips: ['Use short, clear callouts', 'Call before you shoot so teammates can time moves'] },
        { heading: 'Bump Pattern', content: 'The bump is moving from one bunker to the next closer one. On D-side, bumps are usually more linear. Time bumps when opponents are pinned or looking away.' },
      ],
      videoUrl: 'https://www.youtube.com/results?search_query=paintball+doritto+back+player+guide',
      tags: ['doritto', 'position', 'lanes', 'back-player'],
    },
    {
      id: 'g-centre-guide',
      title: 'Centre Player Command',
      category: 'position',
      positions: ['centre'],
      difficulty: 'advanced',
      estimatedMinutes: 10,
      summary: 'The centre player is the quarterback. Learn to control tempo, call plays, and direct traffic.',
      sections: [
        { heading: 'The Quarterback Role', content: 'Centre is the most information-rich position. You can see both sides of the field, making you the primary communicator. Call out opponent positions, count bodies, and direct your team.' },
        { heading: 'Controlling Tempo', content: 'When your team is up on bodies, slow the pace — force the opposition to make desperate moves. When you\'re down, speed up and create chaos.', tips: ['Count bodies constantly', 'Call "push" or "hold" based on numbers'] },
        { heading: 'Dual-Side Support', content: 'Centre players support both snake and doritto sides. Shift your lanes and attention based on where the action is. If snake is pushing, suppress their D-side.' },
        { heading: 'Mid-Game Decisions', content: 'When to rotate, when to hold, when to push — these decisions often come from centre. Read the field, communicate, and lead.' },
      ],
      videoUrl: 'https://www.youtube.com/results?search_query=paintball+centre+mid+player+guide',
      tags: ['centre', 'position', 'communication', 'leadership'],
    },
    {
      id: 'g-snap-shooting',
      title: 'Snap Shooting Drills',
      category: 'fundamentals',
      difficulty: 'beginner',
      estimatedMinutes: 6,
      summary: 'Improve your snap shooting accuracy and speed with at-home and on-field drills.',
      sections: [
        { heading: 'What is Snap Shooting?', content: 'Snap shooting is quickly exposing from a bunker, taking 1-3 shots, and tucking back in. The faster and more accurate your snap, the more dangerous you are.' },
        { heading: 'Mirror Drill (At Home)', content: 'Stand sideways to a mirror. Practice snapping out, aiming at your reflection\'s mask, and tucking back. Focus on minimal body exposure.', tips: ['Start slow, build speed', 'Time yourself: target < 0.5 seconds exposure'] },
        { heading: 'Target Drill (At Home)', content: 'Tape a small target on a wall. Snap from behind a doorframe or furniture. Focus on consistency.', tips: ['50 reps per side daily', 'Track hit percentage'] },
        { heading: 'Live Drill (On Field)', content: 'Two players behind bunkers, 1v1 snap shooting. First to land a hit wins the rep. Run sets of 10.' },
      ],
      tags: ['snap-shooting', 'drill', 'at-home', 'accuracy'],
    },
    {
      id: 'g-comms-playbook',
      title: 'Communication Playbook',
      category: 'fundamentals',
      difficulty: 'beginner',
      estimatedMinutes: 7,
      summary: 'Standard paintball callouts, when to use them, and how to build a team communication system.',
      sections: [
        { heading: 'Why Comms Win Games', content: 'A team that communicates is a team that wins. Calling out positions, movements, and body counts gives your team a massive information advantage.' },
        { heading: 'Standard Callouts', content: 'Bunker names (S1, S2, D1, D2, 50, Centre, Godbox, etc.), "G!" (eliminate), "Bodies up/down", "Push!", "Hold!", "Wrap!", "Bump!"', tips: ['Agree on bunker names before the match', 'Keep calls short: 2-3 words max'] },
        { heading: 'Body Count System', content: 'Always call when you see an elimination. "G doritto!" "Bodies: 4 on 3, push!" This is the most important information for mid-game decisions.' },
        { heading: 'Building Team Comms', content: 'Practice callouts during scrimmages. After each point, review: what info was missed? What calls were late? Consistency is key.' },
      ],
      tags: ['communication', 'callouts', 'team-play'],
    },
    {
      id: 'g-mental-game',
      title: 'The Mental Game',
      category: 'mental',
      difficulty: 'advanced',
      estimatedMinutes: 9,
      summary: 'Pre-game routines, staying focused under pressure, and recovering from bad points.',
      sections: [
        { heading: 'Pre-Point Routine', content: 'Establish a consistent routine before each point: check air, check paint, visualize your run, deep breath. This creates focus and reduces anxiety.' },
        { heading: 'Managing Nerves', content: 'Tournament adrenaline is real. Use box breathing (4-4-4-4) between points. Focus on your job, not the score.', tips: ['Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s', 'Focus on process, not outcome'] },
        { heading: 'Recovering from a Bad Point', content: 'Don\'t carry a bad point into the next one. Quick debrief: what happened, what to adjust. Then reset mentally.', tips: ['Physical reset: shake it off, high-five teammates', '"Next point" mentality — the score resets'] },
        { heading: 'Visualization', content: 'Before games, visualize yourself making plays: clean breakouts, hitting lanes, making moves. Studies show visualization improves performance.' },
      ],
      tags: ['mental', 'focus', 'nerves', 'visualization'],
    },
    {
      id: 'g-fitness',
      title: 'Paintball Fitness Program',
      category: 'fitness',
      difficulty: 'beginner',
      estimatedMinutes: 8,
      summary: 'Improve your speed, agility, and endurance for paintball with targeted exercises.',
      sections: [
        { heading: 'Sprint Conditioning', content: 'Paintball is all sprinting. 10-40 yard dash practice, shuttle runs, and short-burst interval training. Train for explosive speed, not long distance.', tips: ['3x per week sprint training', '10-15 minute sessions are enough'] },
        { heading: 'Agility Drills', content: 'Ladder drills, cone drills, and lateral shuffles. These improve your slide speed and direction changes.', tips: ['YouTube "paintball agility drills" for visual guides'] },
        { heading: 'Core & Stability', content: 'Sliding, crawling, and snapping all require core strength. Planks, Russian twists, and dead bugs are your best friends.' },
        { heading: 'Recovery', content: 'Stretch after every session. Foam roll quads and calves. Paintball is hard on knees — take care of them.' },
      ],
      tags: ['fitness', 'speed', 'agility', 'conditioning'],
    },
  ]
}
