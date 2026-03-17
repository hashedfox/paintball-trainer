import { useAppState } from '../../store/context'

export function WeeklyGoals() {
  const state = useAppState()
  const { challengesState, onboarding } = state

  const weeklyChallenges = challengesState.activeChallenges.filter(c => c.type === 'weekly')
  const completedCount = weeklyChallenges.filter(c => c.completed).length

  return (
    <div className="bg-[#161B22] rounded-xl border border-pb-border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-sm font-bold text-pb-text uppercase tracking-wider">
          Weekly Goals
        </span>
        <span className="font-stat text-[10px] text-pb-text-dim">
          {completedCount}/{weeklyChallenges.length} complete
        </span>
      </div>

      {onboarding.completed && (
        <div className="bg-[#21262D] rounded-lg border border-pb-border p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-pb-text-dim">Training commitment</span>
            <span className="font-stat text-xs font-bold text-pb-green">{onboarding.weeklyTrainingHours} hrs/week</span>
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
                : 'border-pb-border bg-[#21262D]'
            }`}
          >
            <span className="text-base">{challenge.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold ${challenge.completed ? 'text-pb-green' : 'text-pb-text'}`}>
                  {challenge.title}
                </span>
                <span className="font-stat text-[9px] text-pb-text-muted">
                  {challenge.progress}/{challenge.requirement}
                </span>
              </div>
              <div className="w-full h-[5px] bg-[#0D1117] rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((challenge.progress / challenge.requirement) * 100, 100)}%`,
                    background: challenge.completed
                      ? '#39D353'
                      : 'linear-gradient(90deg, #A371F7, #58A6FF)',
                  }}
                />
              </div>
            </div>
            <span className="font-stat text-[9px] text-pb-amber font-bold whitespace-nowrap">+{challenge.xpReward} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
