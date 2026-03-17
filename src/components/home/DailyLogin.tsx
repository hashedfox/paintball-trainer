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
    <div className="bg-[#161B22] rounded-xl border border-pb-border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-sm font-bold text-pb-text uppercase tracking-wider">
          Daily Streak
        </span>
        <span className="font-stat text-xs font-bold text-pb-green">
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex gap-1.5">
        {days.map((day) => (
          <div
            key={day}
            className={`flex-1 aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
              day <= streak
                ? 'bg-pb-green/15 text-pb-green border border-pb-green/30'
                : 'bg-[#21262D] text-pb-text-muted border border-pb-border'
            }`}
          >
            {day <= streak ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : day}
          </div>
        ))}
      </div>
      <p className="text-[9px] text-pb-text-muted mt-2">
        Log in daily for bonus XP & coins. {streak >= 7 ? 'Max streak bonus active!' : `${7 - streak} more for max bonus.`}
      </p>
    </div>
  )
}
