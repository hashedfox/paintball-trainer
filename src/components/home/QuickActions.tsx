import type { SectionId } from '../../store/context'

interface Props {
  onNavigate: (section: SectionId) => void
}

const ACTIONS: { section: SectionId; label: string; desc: string; color: string; icon: string }[] = [
  { section: 'ppi', label: 'Track Game', desc: 'Log point stats', color: 'from-pb-neon/20 to-pb-neon/5', icon: '📊' },
  { section: 'challenges', label: 'Challenges', desc: 'Earn XP & coins', color: 'from-pb-amber/20 to-pb-amber/5', icon: '⚡' },
  { section: 'guides', label: 'Guides', desc: 'Learn & improve', color: 'from-pb-blue/20 to-pb-blue/5', icon: '📖' },
  { section: 'persona', label: 'Persona', desc: 'Customize gear', color: 'from-pb-purple/20 to-pb-purple/5', icon: '🎮' },
]

export function QuickActions({ onNavigate }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ACTIONS.map((action) => (
        <button
          key={action.section}
          type="button"
          onClick={() => onNavigate(action.section)}
          className={`card-gaming p-4 text-left bg-gradient-to-br ${action.color} hover:scale-[1.02] transition-transform`}
        >
          <span className="text-2xl">{action.icon}</span>
          <div className="mt-2">
            <div className="text-sm font-bold text-white">{action.label}</div>
            <div className="text-[10px] text-pb-text-dim">{action.desc}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
