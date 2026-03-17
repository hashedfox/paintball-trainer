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

  const filtered = challengesState.activeChallenges.filter(c =>
    filter === 'all' || c.type === filter
  )

  const handleComplete = (id: string) => {
    dispatch({ type: 'COMPLETE_CHALLENGE', challengeId: id })
  }

  const handleProgress = (id: string, amount: number) => {
    const challenge = challengesState.activeChallenges.find(c => c.id === id)
    if (!challenge) return
    const newProgress = Math.min(challenge.progress + amount, challenge.requirement)
    dispatch({ type: 'UPDATE_CHALLENGE_PROGRESS', challengeId: id, progress: newProgress })
    if (newProgress >= challenge.requirement) {
      handleComplete(id)
    }
  }

  if (view === 'marketplace') {
    return (
      <div className="animate-fade-in">
        <div className="p-4 border-b border-pb-border flex items-center justify-between">
          <button type="button" onClick={() => setView('challenges')} className="text-pb-neon text-sm font-medium flex items-center gap-1">
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
        <div>
          <h2 className="text-xl font-black text-white">Challenges</h2>
          <p className="text-xs text-pb-text-dim">Complete daily and weekly tasks to earn XP and coins</p>
        </div>
        <button
          type="button"
          onClick={() => setView('marketplace')}
          className="flex items-center gap-2 px-3 py-1.5 bg-pb-amber/10 border border-pb-amber/20 rounded-lg text-xs font-medium text-pb-amber hover:bg-pb-amber/20 transition-colors"
        >
          <span className="coin-badge">{challengesState.coins}</span>
          Shop
        </button>
      </div>

      {/* Level & XP */}
      <div className="card-gaming p-5 glow-green">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pb-neon to-pb-blue flex items-center justify-center">
            <span className="text-2xl font-black text-pb-darker">{challengesState.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">Level {challengesState.level}</span>
              <span className="text-xs text-pb-text-dim">{Math.round(xpInLevel)} / {currentLevelXp} XP</span>
            </div>
            <div className="xp-bar-track h-3">
              <div className="xp-bar-fill h-full" style={{ width: `${xpProgress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-pb-text-muted">Total: {challengesState.xp} XP</span>
              <span className="text-[10px] text-pb-text-muted">Streak: {challengesState.loginStreak} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'daily', 'weekly', 'milestone'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              filter === f
                ? 'bg-pb-neon text-pb-darker'
                : 'bg-pb-surface text-pb-text-dim border border-pb-border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Challenges list */}
      <div className="space-y-3">
        {filtered.map((challenge) => (
          <div
            key={challenge.id}
            className={`challenge-card p-4 ${challenge.completed ? 'completed' : ''}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{challenge.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${challenge.completed ? 'text-pb-green line-through' : 'text-white'}`}>
                    {challenge.title}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    challenge.type === 'daily' ? 'bg-pb-blue/10 text-pb-blue' :
                    challenge.type === 'weekly' ? 'bg-pb-purple/10 text-pb-purple' :
                    'bg-pb-gold/10 text-pb-gold'
                  }`}>
                    {challenge.type}
                  </span>
                </div>
                <p className="text-[11px] text-pb-text-dim mt-0.5">{challenge.description}</p>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-pb-text-muted">
                      {challenge.progress}/{challenge.requirement}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-pb-amber font-bold">+{challenge.xpReward} XP</span>
                      <span className="text-[10px] text-pb-gold font-bold">+{challenge.coinReward} C</span>
                    </div>
                  </div>
                  <div className="xp-bar-track">
                    <div
                      className={`h-full rounded-full transition-all ${challenge.completed ? 'bg-pb-green' : ''}`}
                      style={{
                        width: `${Math.min((challenge.progress / challenge.requirement) * 100, 100)}%`,
                        background: challenge.completed ? '#22c55e' : 'linear-gradient(90deg, #00ff88, #06b6d4)',
                      }}
                    />
                  </div>
                </div>

                {/* Action button */}
                {!challenge.completed && (
                  <button
                    type="button"
                    onClick={() => handleProgress(challenge.id, 1)}
                    className="mt-2 px-3 py-1 bg-pb-surface border border-pb-border rounded-lg text-[10px] text-pb-neon font-medium hover:bg-pb-neon/5 transition-colors"
                  >
                    + Log Progress
                  </button>
                )}

                {challenge.ppiImpact && (
                  <span className="text-[9px] text-pb-text-muted mt-1 block">
                    Improves: {challenge.ppiImpact}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
