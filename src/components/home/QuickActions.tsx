import type { SectionId } from '../../store/context'

interface Props {
  onNavigate: (section: SectionId) => void
}

const ACTIONS: { section: SectionId; label: string; desc: string; gradient: string; icon: string }[] = [
  { section: 'ppi', label: 'Track Game', desc: 'Log point stats', gradient: 'from-pb-primary/15 to-pb-primary/5', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10' },
  { section: 'challenges', label: 'Challenges', desc: 'Earn XP & coins', gradient: 'from-pb-amber/15 to-pb-amber/5', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { section: 'guides', label: 'Guides', desc: 'Learn & improve', gradient: 'from-pb-blue/15 to-pb-blue/5', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
  { section: 'persona', label: 'Persona', desc: 'Customize gear', gradient: 'from-pb-pink/15 to-pb-pink/5', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
]

export function QuickActions({ onNavigate }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ACTIONS.map((action) => (
        <button
          key={action.section}
          type="button"
          onClick={() => onNavigate(action.section)}
          className={`card-gaming p-4 text-left bg-gradient-to-br ${action.gradient} hover:scale-[1.02] transition-transform`}
        >
          <svg className="w-6 h-6 text-pb-text-dim mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
          </svg>
          <div className="text-[12px] font-bold text-white">{action.label}</div>
          <div className="text-[9px] text-pb-text-muted">{action.desc}</div>
        </button>
      ))}
    </div>
  )
}
