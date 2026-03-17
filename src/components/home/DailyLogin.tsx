import { useEffect } from 'react'
import { useAppState, useDispatch } from '../../store/context'

export function DailyLogin() {
  const state = useAppState()
  const dispatch = useDispatch()
  const { challengesState } = state

  useEffect(() => {
    dispatch({ type: 'RECORD_LOGIN' })
  }, [dispatch])

  const streak = challengesState.loginStreak
  const days = Array.from({ length: 7 }, (_, i) => i + 1)

  return (
    <div className="card-gaming p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Streak</h3>
        <span className="text-pb-neon font-bold text-sm">{streak} day{streak !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex gap-2">
        {days.map((day) => (
          <div
            key={day}
            className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
              day <= streak
                ? 'bg-pb-neon/20 text-pb-neon border border-pb-neon/30'
                : 'bg-pb-surface text-pb-text-muted border border-pb-border'
            }`}
          >
            {day <= streak ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : day}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-pb-text-muted mt-2">
        Log in daily to earn bonus XP and coins. {streak >= 7 ? 'Max streak bonus active!' : `${7 - streak} more for max bonus.`}
      </p>
    </div>
  )
}
