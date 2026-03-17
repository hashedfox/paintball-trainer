import { useState } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { xpForLevel } from '../../types/challenges'
import { Marketplace } from './Marketplace'

export function ChallengesSection() {
  const state = useAppState()
  const dispatch = useDispatch()
  const { challengesState } = state
  const [view, setView] = useState<'challenges' | 'marketplace'>('challenges')
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'milestone'>('all')

  const currentLevelXp = xpForLevel(challengesState.level)
  const prevLevelTotalXp = Array.from({ length: challengesState.level - 1 }, (_, i) => xpForLevel(i + 1)).reduce((a, b) => a + b, 0)
  const xpInLevel = challengesState.xp - prevLevelTotalXp
  const xpProgress = Math.min((xpInLevel / currentLevelXp) * 100, 100)

  const filtered = challengesState.activeChallenges.filter(c => filter === 'all' || c.type === filter)

  const handleProgress = (id: string, amount: number) => {
    const challenge = challengesState.activeChallenges.find(c => c.id === id)
    if (!challenge) return
    const newProgress = Math.min(challenge.progress + amount, challenge.requirement)
    dispatch({ type: 'UPDATE_CHALLENGE_PROGRESS', challengeId: id, progress: newProgress })
    if (newProgress >= challenge.requirement) {
      dispatch({ type: 'COMPLETE_CHALLENGE', challengeId: id })
    }
  }

  if (view === 'marketplace') {
    return (
      <div className="animate-fade-in">
        <div className="p-4 border-b border-pb-border flex items-center justify-between">
          <button type="button" onClick={() => setView('challenges')} className="text-pb-primary-bright text-[12px] font-semibold flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Challenges
          </button>
          <span className="coin-badge">{challengesState.coins} coins</span>
        </div>
        <Marketplace />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-white">Challenges</h2>
        <button type="button" onClick={() => setView('marketplace')}
          className="flex items-center gap-2 btn-secondary"
        >
          <span className="coin-badge">{challengesState.coins}</span>
          Shop
        </button>
      </div>

      {/* Level card */}
      <div className="card-gaming p-5 glow-purple">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-pb-primary flex items-center justify-center">
            <span className="text-2xl font-black text-white">{challengesState.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-bold text-white">Level {challengesState.level}</span>
              <span className="text-[11px] text-pb-text-dim">{Math.round(xpInLevel)} / {currentLevelXp} XP</span>
            </div>
            <div className="xp-bar-track h-[10px]">
              <div className="xp-bar-fill h-full" style={{ width: `${xpProgress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-pb-text-muted">Total: {challengesState.xp} XP</span>
              <span className="text-[9px] text-pb-text-muted">Streak: {challengesState.loginStreak} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(['all', 'daily', 'weekly', 'milestone'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`pill-tab capitalize ${filter === f ? 'pill-tab-active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Challenges */}
      <div className="space-y-3">
        {filtered.map((challenge) => (
          <div key={challenge.id} className={`challenge-card p-4 ${challenge.completed ? 'completed' : ''}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{challenge.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-[12px] font-bold ${challenge.completed ? 'text-pb-green line-through' : 'text-white'}`}>
                    {challenge.title}
                  </h4>
                  <span className={`tag-pill ${
                    challenge.type === 'daily' ? 'tag-blue' : challenge.type === 'weekly' ? 'tag-purple' : 'tag-gold'
                  }`}>
                    {challenge.type}
                  </span>
                </div>
                <p className="text-[10px] text-pb-text-dim mt-0.5">{challenge.description}</p>

                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-pb-text-muted">{challenge.progress}/{challenge.requirement}</span>
                    <div className="flex gap-2">
                      <span className="text-[9px] text-pb-amber font-bold">+{challenge.xpReward} XP</span>
                      <span className="text-[9px] text-pb-gold font-bold">+{challenge.coinReward} C</span>
                    </div>
                  </div>
                  <div className="xp-bar-track h-[5px]">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((challenge.progress / challenge.requirement) * 100, 100)}%`,
                        background: challenge.completed ? '#49b4a0' : 'linear-gradient(90deg, #5b4dc7, #7c6fe0)',
                      }}
                    />
                  </div>
                </div>

                {!challenge.completed && (
                  <button type="button" onClick={() => handleProgress(challenge.id, 1)}
                    className="mt-2 btn-secondary text-[10px] py-1 px-3"
                  >
                    + Log Progress
                  </button>
                )}

                {challenge.ppiImpact && (
                  <span className="text-[8px] text-pb-text-muted mt-1 block">Improves: {challenge.ppiImpact}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
