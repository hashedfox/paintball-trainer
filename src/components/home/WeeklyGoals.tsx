import { useAppState } from '../../store/context'

export function WeeklyGoals() {
  const state = useAppState()
  const { challengesState, onboarding } = state

  const weeklyChallenges = challengesState.activeChallenges.filter(c => c.type === 'weekly')
  const completedCount = weeklyChallenges.filter(c => c.completed).length

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-sm font-bold text-[#F1F5F9] uppercase tracking-wider">
          Weekly Goals
        </span>
        <span className="font-stat text-[10px] text-[#94A3B8]">
          {completedCount}/{weeklyChallenges.length} complete
        </span>
      </div>

      {onboarding.completed && (
        <div className="bg-[#2A3050] rounded-lg border border-white/[0.08] p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8]">Training commitment</span>
            <span className="font-stat text-xs font-bold text-[#2DD4A8]">{onboarding.weeklyTrainingHours} hrs/week</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {weeklyChallenges.map(challenge => (
          <div
            key={challenge.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              challenge.completed
                ? 'border-[#2DD4A8]/30 bg-[#2DD4A8]/5'
                : 'border-white/[0.08] bg-[#2A3050]'
            }`}
          >
            <span className="text-base">{challenge.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold ${challenge.completed ? 'text-[#2DD4A8]' : 'text-[#F1F5F9]'}`}>
                  {challenge.title}
                </span>
                <span className="font-stat text-[9px] text-[#64748B]">
                  {challenge.progress}/{challenge.requirement}
                </span>
              </div>
              <div className="w-full h-[5px] bg-[#0A0E1A] rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((challenge.progress / challenge.requirement) * 100, 100)}%`,
                    background: challenge.completed
                      ? '#2DD4A8'
                      : 'linear-gradient(90deg, #7C5BF0, #4A7BF7)',
                  }}
                />
              </div>
            </div>
            <span className="font-stat text-[9px] text-[#D4A843] font-bold whitespace-nowrap">+{challenge.xpReward} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
