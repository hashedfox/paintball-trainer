import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { SwotAnalysis } from './SwotAnalysis'
import { FormationTable } from './FormationTable'
import { BreakoutPlay } from './BreakoutPlay'
import type { FieldLayoutData } from '../../types/playbook'

const LAYOUTS: FieldLayoutData[] = [
  {
    archetype: 'standard-212',
    name: 'Standard 2-1-2',
    description: 'The bread-and-butter layout used at events like the 2024 Lone Star Major. Balanced attack surface with equal snake/doritto opportunity.',
    swot: {
      strengths: [
        'Balanced attack options — both tapes equally viable',
        'Centre diamond provides late-game breaking opportunities',
        'Multiple cross-field shooting lanes for trade kills',
      ],
      weaknesses: [
        'No dominant tape means less specialization advantage',
        'Centre positions can be exposed to both sides',
        'Predictable bunker distances reduce surprise factor',
      ],
      opportunities: [
        'Teams with strong centre players can control tempo',
        'Balanced layout rewards adaptable play-calling',
        'Good for running multiple breakout variations',
      ],
      threats: [
        'Opponent can match any strategy with mirror play',
        'No natural choke points to exploit',
        'Teams with weak mid-game struggle on open layouts',
      ],
    },
    formations: [
      {
        name: 'Standard',
        positions: {
          snake1: { bunker: 'S1', role: 'Primary runner — push snake tape' },
          snake2: { bunker: 'S2', role: 'Secondary snake — lane support' },
          centre: { bunker: 'C/50', role: 'Control centre — call plays' },
          doritto1: { bunker: 'D1', role: 'Primary D-side — mirror snake push' },
          doritto2: { bunker: 'D2', role: 'Anchor — hold D-side and lane' },
        },
      },
    ],
    breakoutPlays: [
      {
        name: 'Stack Left (Snake Push)',
        description: 'Snake 1 and 2 push deep snake-side while Centre and D-side lane. Aim for snake control by second bunker exchange.',
        positions: { snake1: 'S3', snake2: 'S2', centre: '50', doritto1: 'D1 lane', doritto2: 'D2 lane' },
      },
      {
        name: 'Stack Right (D-Side Heavy)',
        description: 'D1 pushes to doritto 50 while D2 holds back lane. Snake players hold and lane to buy time for D-side collapse.',
        positions: { snake1: 'S1 hold', snake2: 'S2 lane', centre: '50', doritto1: 'D50', doritto2: 'D2' },
      },
      {
        name: 'Spread',
        description: 'All 5 players break to equidistant positions. Maximum field coverage. Best against unpredictable opponents.',
        positions: { snake1: 'S2', snake2: 'S1', centre: '50', doritto1: 'D1', doritto2: 'D2' },
      },
    ],
    proReference: 'Dynasty has historically excelled on balanced 2-1-2 layouts by using Marcello Margott\'s centre play to create late-game breaking opportunities. At the 2024 Lone Star Major, the 2-1-2 favoured teams with strong mid-game adaptability.',
  },
  {
    archetype: 'long-linear-snake',
    name: 'Long Linear Snake',
    description: 'The meta-defining layout from 2024 when the NXL introduced 14 snake beams. Super long linear snake with doritto side essentially in a line.',
    swot: {
      strengths: [
        'Snake dominance — deep snake control wins points',
        'Long snake allows multiple staging bunkers',
        'Laning is more predictable on linear layouts',
      ],
      weaknesses: [
        'One laner can shut down an entire snake push',
        'D-side becomes secondary — less threat diversity',
        'Predictable push direction makes you readable',
      ],
      opportunities: [
        'Teams with elite snake players gain huge advantage',
        'Secondary D-side push catches snake-focused opponents off guard',
        'Extended snake allows more trade-up opportunities',
      ],
      threats: [
        'Opponent dedicates 2 laners to snake and shuts you down',
        'If snake player dies OTB, entire strategy collapses',
        'Long snake means longer exposure during movement',
      ],
    },
    formations: [
      {
        name: 'Snake Priority',
        positions: {
          snake1: { bunker: 'S1→S3', role: 'Deep snake runner — get to S3 alive' },
          snake2: { bunker: 'S2', role: 'Snake support — lane and bump' },
          centre: { bunker: '50/CS', role: 'Cross-field support — switch lanes' },
          doritto1: { bunker: 'D1', role: 'D-side holder — secondary threat' },
          doritto2: { bunker: 'D2', role: 'Back lane — suppress opponent snake laners' },
        },
      },
    ],
    breakoutPlays: [
      {
        name: 'Snake Flood',
        description: 'Snake 1 goes deep immediately. Snake 2 bumps to S2. Centre lanes doritto side. All pressure on snake tape.',
        positions: { snake1: 'S3', snake2: 'S2', centre: '50 lane', doritto1: 'D1 hold', doritto2: 'D2 lane' },
      },
      {
        name: 'D-Side Surprise',
        description: 'Fake snake push — Snake 1 holds S1. D1 and D2 push aggressively while opponents focus snake.',
        positions: { snake1: 'S1 hold', snake2: 'S1 lane', centre: '50', doritto1: 'D50', doritto2: 'D2 push' },
      },
      {
        name: 'Split Tape',
        description: 'Even split — Snake 1 pushes snake, D1 pushes D-side. Centre supports whichever tape gets the early kill.',
        positions: { snake1: 'S2→S3', snake2: 'S1 lane', centre: '50 flex', doritto1: 'D2→D50', doritto2: 'D1 lane' },
      },
    ],
    proReference: 'The 2024 NXL season saw the introduction of 14-beam snake layouts that pushed gameplay heavily toward the tapes. Tampa Bay Damage\'s aggressive snake-side play contributed to their strong performances throughout the season.',
  },
  {
    archetype: 'diagonal-symmetry',
    name: 'Diagonal Symmetry',
    description: 'Introduced at the 2024 NXL Las Vegas Open. Built on diagonal rather than left-right symmetry, forcing teams to prepare two completely different breakouts.',
    swot: {
      strengths: [
        'Forces opponents to prepare two breakout plans',
        'Diagonal lanes create unexpected angles',
        'Rewards creative play-calling over brute force',
      ],
      weaknesses: [
        'Players must master asymmetric bunker positions',
        'Harder to drill — more breakout combinations needed',
        'Communication must account for non-standard positions',
      ],
      opportunities: [
        'Teams that adapt fastest gain a huge edge',
        'Diagonal angles open up new bunkering routes',
        'Less studied by opponents — surprise factor',
      ],
      threats: [
        'Unfamiliar layout means more OTB deaths from bad reads',
        'Diagonal symmetry can confuse comms ("left" and "right" shift)',
        'If opponent studies it more, your preparation gap hurts',
      ],
    },
    formations: [
      {
        name: 'Adaptive',
        positions: {
          snake1: { bunker: 'S1/S2', role: 'Read the diagonal — adjust breakout live' },
          snake2: { bunker: 'Mid-S', role: 'Float between snake and centre' },
          centre: { bunker: 'C50', role: 'Anchor — communicate diagonal shifts' },
          doritto1: { bunker: 'D1/D2', role: 'Mirror snake-side aggression level' },
          doritto2: { bunker: 'Back-D', role: 'Deep lane — cover diagonal gaps' },
        },
      },
    ],
    breakoutPlays: [
      {
        name: 'Diagonal Cut',
        description: 'Players break diagonally rather than straight — Snake 1 cuts to centre-snake, D1 cuts to centre-D. Creates X-pattern.',
        positions: { snake1: 'CS', snake2: 'S2', centre: '50', doritto1: 'CD', doritto2: 'D2' },
      },
      {
        name: 'Mirror Break',
        description: 'Treat it like standard symmetry — ignore the diagonal and play your normal game. Sometimes simplicity wins.',
        positions: { snake1: 'S2', snake2: 'S1', centre: '50', doritto1: 'D1', doritto2: 'D2' },
      },
      {
        name: 'Overload Near',
        description: 'Stack 3 players on the near tape (relative to your start box position). Use diagonal angles to create crossfire.',
        positions: { snake1: 'S3', snake2: 'S2', centre: 'CS', doritto1: 'D1 hold', doritto2: 'D2 lane' },
      },
    ],
    proReference: 'The 2024 NXL Las Vegas Open introduced diagonal field symmetry to the pro circuit. This format forces teams to prepare two fundamentally different breakout strategies depending on which side of the field they start from, rewarding tactical flexibility.',
  },
]

export function PlaybookTab() {
  const t = useTranslation()
  const [layoutIdx, setLayoutIdx] = useState(0)
  const layout = LAYOUTS[layoutIdx]

  return (
    <div className="p-4 space-y-4">
      {/* Layout selector */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{t('playbook.selectLayout')}</h2>
        <div className="flex gap-2">
          {LAYOUTS.map((l, i) => (
            <button
              key={l.archetype}
              type="button"
              onClick={() => setLayoutIdx(i)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                i === layoutIdx ? 'bg-[#D4A843] text-black' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4">
        <h3 className="text-sm font-bold text-white mb-2">{layout.name}</h3>
        <p className="text-xs text-slate-400">{layout.description}</p>
      </div>

      {/* SWOT */}
      <SwotAnalysis swot={layout.swot} />

      {/* Formations */}
      <FormationTable formations={layout.formations} />

      {/* Breakout plays */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('playbook.plays')}</h3>
        {layout.breakoutPlays.map((play, i) => (
          <BreakoutPlay key={i} play={play} />
        ))}
      </div>

      {/* Pro reference */}
      <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4">
        <h3 className="text-sm font-bold text-white mb-2">{t('playbook.proRef')}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{layout.proReference}</p>
      </div>
    </div>
  )
}
