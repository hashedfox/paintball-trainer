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
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Hero */}
      <div className="card-gaming p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pb-primary/8 to-transparent" />
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
            Win More Paintball Games
          </h2>
          <p className="text-pb-text-dim text-sm max-w-lg">
            Track your performance, complete challenges, and level up your competitive paintball game.
          </p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="level-badge text-[13px] px-4 py-1.5">Level {challengesState.level}</span>
            <div className="flex-1 max-w-xs">
              <div className="xp-bar-track">
                <div className="xp-bar-fill" style={{ width: `${(challengesState.xp % 100)}%` }} />
              </div>
              <span className="text-[9px] text-pb-text-muted">{challengesState.xp} XP</span>
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
          <span className="section-header">
            Your Focus: {onboarding.primaryPosition.replace(/([0-9])/g, ' $1').toUpperCase()}
          </span>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="stat-card">
              <div className="stat-card-value text-pb-primary-bright">Guides</div>
              <div className="stat-card-label">Deep dives</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value text-pb-blue">Drills</div>
              <div className="stat-card-label">Daily tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value text-pb-amber">Pros</div>
              <div className="stat-card-label">Players to follow</div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="card-gaming p-5">
        <span className="section-header">Pro Tips Newsletter</span>
        <p className="text-[11px] text-pb-text-dim mt-2 mb-3">Get weekly coaching advice, drill recommendations, and pro analysis straight to your inbox.</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 bg-pb-surface border border-pb-border rounded-md px-3 py-2 text-sm text-white placeholder-pb-text-muted focus:outline-none focus:border-pb-primary"
          />
          <button type="button" className="btn-primary">
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
          className="text-[10px] text-pb-text-muted hover:text-pb-text-dim transition-colors"
        >
          Retake onboarding quiz
        </button>
      )}
    </div>
  )
}
