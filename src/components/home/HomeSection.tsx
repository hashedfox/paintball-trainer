import { useState } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { OnboardingQuiz } from './OnboardingQuiz'
import { WeeklyGoals } from './WeeklyGoals'
import { DailyLogin } from './DailyLogin'
import { QuickActions } from './QuickActions'

export function HomeSection() {
  const state = useAppState()
  const dispatch = useDispatch()
  const { onboarding, challengesState } = state
  const [showQuiz, setShowQuiz] = useState(!onboarding.completed)

  if (showQuiz && !onboarding.completed) {
    return <OnboardingQuiz onComplete={() => setShowQuiz(false)} />
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="card-gaming p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pb-neon/5 to-pb-blue/5" />
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
            Win More Paintball Games
          </h2>
          <p className="text-pb-text-dim text-sm md:text-base max-w-lg">
            Track your performance, complete challenges, and level up your competitive paintball game.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <span className="level-badge text-base px-4 py-1">Level {challengesState.level}</span>
            <div className="flex-1 max-w-xs">
              <div className="xp-bar-track">
                <div className="xp-bar-fill" style={{ width: `${(challengesState.xp % 100)}%` }} />
              </div>
              <span className="text-[10px] text-pb-text-muted">{challengesState.xp} XP</span>
            </div>
            <span className="coin-badge">{challengesState.coins} coins</span>
          </div>
        </div>
      </div>

      {/* Daily Login Streak */}
      <DailyLogin />

      {/* Quick Actions */}
      <QuickActions onNavigate={(s) => dispatch({ type: 'SET_ACTIVE_SECTION', section: s })} />

      {/* Weekly Goals */}
      <WeeklyGoals />

      {/* Position overview */}
      {onboarding.completed && (
        <div className="card-gaming p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Your Focus: {onboarding.primaryPosition.replace(/([0-9])/g, ' $1').toUpperCase()}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-pb-surface rounded-lg p-3 text-center">
              <div className="text-pb-neon text-lg font-bold">Guides</div>
              <p className="text-[10px] text-pb-text-muted mt-1">Position-specific deep dives</p>
            </div>
            <div className="bg-pb-surface rounded-lg p-3 text-center">
              <div className="text-pb-blue text-lg font-bold">Drills</div>
              <p className="text-[10px] text-pb-text-muted mt-1">Daily improvement tasks</p>
            </div>
            <div className="bg-pb-surface rounded-lg p-3 text-center">
              <div className="text-pb-purple text-lg font-bold">Pros</div>
              <p className="text-[10px] text-pb-text-muted mt-1">Players to follow</p>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Pro Tips Newsletter</h3>
        <p className="text-xs text-pb-text-dim mb-3">Get weekly coaching advice, drill recommendations, and pro analysis straight to your inbox.</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 bg-pb-surface border border-pb-border rounded-lg px-3 py-2 text-sm text-white placeholder-pb-text-muted focus:outline-none focus:border-pb-neon"
          />
          <button type="button" className="bg-pb-neon text-pb-darker font-bold px-4 py-2 rounded-lg text-sm hover:bg-pb-neon-dim transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Re-take quiz */}
      {onboarding.completed && (
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_ONBOARDING', data: { completed: false } })
            setShowQuiz(true)
          }}
          className="text-xs text-pb-text-muted hover:text-pb-text-dim transition-colors"
        >
          Retake onboarding quiz
        </button>
      )}
    </div>
  )
}
