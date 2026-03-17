import { useAppState } from '../../store/context'

export function WeeklyGoals() {
  const state = useAppState()
  const { challengesState, onboarding } = state

  const weeklyChallenges = challengesState.activeChallenges.filter(c => c.type === 'weekly')
  const completedCount = weeklyChallenges.filter(c => c.completed).length

  return (
    <div className="card-gaming p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="section-header">Weekly Goals</span>
        <span className="text-[10px] text-pb-text-dim">{completedCount}/{weeklyChallenges.length} complete</span>
      </div>

      {onboarding.completed && (
        <div className="panel-inner p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-pb-text-dim">Training commitment</span>
            <span className="text-[12px] font-bold text-pb-primary-bright">{onboarding.weeklyTrainingHours} hrs/week</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {weeklyChallenges.map(challenge => (
          <div
            key={challenge.id}
            className={`flex items-center gap-3 p-3 rounded-md border transition-all ${
              challenge.completed
                ? 'border-pb-green/30 bg-pb-green/5'
                : 'border-pb-border bg-pb-surface'
            }`}
          >
            <span className="text-base">{challenge.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold ${challenge.completed ? 'text-pb-green' : 'text-white'}`}>
                  {challenge.title}
                </span>
                <span className="text-[9px] text-pb-text-muted">
                  {challenge.progress}/{challenge.requirement}
                </span>
              </div>
              <div className="xp-bar-track mt-1.5 h-[5px]">
                <div
                  className="xp-bar-fill h-full"
                  style={{
                    width: `${Math.min((challenge.progress / challenge.requirement) * 100, 100)}%`,
                    background: challenge.completed ? '#49b4a0' : undefined,
                  }}
                />
              </div>
            </div>
            <span className="text-[9px] text-pb-amber font-bold whitespace-nowrap">+{challenge.xpReward} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
