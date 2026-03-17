export interface TrainingResource {
  id: string
  title: string
  source: string
  url: string
  description: string
  areas: string[] // which weakness areas this helps with
}

export const TRAINING_RESOURCES: TrainingResource[] = [
  {
    id: 'bki-snap',
    title: 'Snap Shooting Combine Drill',
    source: 'BKI Paintball',
    url: 'https://www.bkipaintball.com/',
    description: 'Ryan Greenspan\'s snap shooting combine drill. Builds muscle memory for fast, accurate snapping from behind bunkers.',
    areas: ['survival', 'kills'],
  },
  {
    id: 'bk-3row',
    title: 'Three-in-a-Row Snap Accuracy',
    source: 'Bunkerkings',
    url: 'https://www.bunkerkings.com/',
    description: 'Bunkerkings\' snap accuracy drill — hit three targets in a row before moving to the next bunker. Builds consistency under pressure.',
    areas: ['kills', 'g1'],
  },
  {
    id: 'virtue-breakout',
    title: 'Breakout Reps Without Burning Paint',
    source: 'Virtue Paintball',
    url: 'https://virtuepb.com/',
    description: 'Virtue PB\'s guide to drilling breakout reps efficiently. Focus on footwork, timing, and slide technique without wasting cases of paint.',
    areas: ['otb', 'survival'],
  },
  {
    id: 'bki-adrill',
    title: 'The A-Drill — Shooters & Runners',
    source: 'BKI Paintball',
    url: 'https://www.bkipaintball.com/',
    description: 'Kyle Spicka\'s A-Drill for improving coordination between shooters and runners off the break. Builds team timing.',
    areas: ['otb', 'g1', 'comms'],
  },
  {
    id: 'bki-comms',
    title: 'Communication Drill — Live Calls',
    source: 'BKI Paintball',
    url: 'https://www.bkipaintball.com/',
    description: 'Practice live communication under pressure. Call out opponent positions, bunker names, and movement in real-time.',
    areas: ['comms'],
  },
  {
    id: 'bki-penalty',
    title: 'Clean Play — Avoiding Penalties',
    source: 'BKI Paintball',
    url: 'https://www.bkipaintball.com/',
    description: 'Understanding common penalty triggers: playing on, overshooting, and wiping. Drill clean play habits to avoid giving up points.',
    areas: ['discipline'],
  },
]
