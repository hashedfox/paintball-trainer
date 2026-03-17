import { useAppState } from '../../store/context'

export function WeeklyGoals() {
  const state = useAppState()
  const { challengesState, onboarding } = state

  const weeklyChallenges = challengesState.activeChallenges.filter(c => c.type === 'weekly')
  const completedCount = weeklyChallenges.filter(c => c.completed).length

  return (
    <div className="card-gaming p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Goals</h3>
        <span className="text-xs text-pb-text-dim">{completedCount}/{weeklyChallenges.length} complete</span>
      </div>

      {/* Training commitment */}
      {onboarding.completed && (
        <div className="bg-pb-surface rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-pb-text-dim">Training commitment</span>
            <span className="text-sm font-bold text-pb-neon">{onboarding.weeklyTrainingHours} hrs/week</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {weeklyChallenges.map(challenge => (
          <div
            key={challenge.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              challenge.completed
                ? 'border-pb-green/30 bg-pb-green/5'
                : 'border-pb-border bg-pb-surface'
            }`}
          >
            <span className="text-lg">{challenge.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${challenge.completed ? 'text-pb-green' : 'text-white'}`}>
                  {challenge.title}
                </span>
                <span className="text-[10px] text-pb-text-muted">
                  {challenge.progress}/{challenge.requirement}
                </span>
              </div>
              <div className="xp-bar-track mt-1.5">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${Math.min((challenge.progress / challenge.requirement) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-pb-amber font-bold">+{challenge.xpReward} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
