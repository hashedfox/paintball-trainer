import { useTranslation } from '../../i18n/useTranslation'
import { useAppState, useDispatch } from '../../store/context'
import { PointSelector } from './PointSelector'
import { TeamSummaryPanel } from './TeamSummaryPanel'
import { PlayerCard } from './PlayerCard'
import { FloatingButton } from '../ui/FloatingButton'

export function PointsTab() {
  const t = useTranslation()
  const { points, activePointIndex, roster } = useAppState()
  const dispatch = useDispatch()
  const hasDummy = points.some((p) => p.isDummyData)

  const activePoint = points[activePointIndex]

  const addPoint = () => {
    if (hasDummy) {
      dispatch({ type: 'CLEAR_DUMMY_DATA' })
    }
    dispatch({ type: 'ADD_POINT' })
  }

  return (
    <div className="p-4 space-y-4">
      {hasDummy && (
        <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg px-3 py-2 text-xs text-yellow-300">
          {t('points.demoData')}
        </div>
      )}

      {points.length > 0 && (
        <PointSelector
          points={points}
          activeIndex={activePointIndex}
          onSelect={(i) => dispatch({ type: 'SET_ACTIVE_POINT', index: i })}
        />
      )}

      {activePoint ? (
        <>
          <TeamSummaryPanel point={activePoint} />
          <div className="space-y-3">
            {roster.map((player, i) => {
              const ps = activePoint.playerStats.find((s) => s.playerId === player.id)
              if (!ps) return null
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  stats={ps}
                  pointId={activePoint.id}
                  defaultExpanded={i === 0}
                />
              )
            })}
          </div>
        </>
      ) : (
        <div className="text-center text-slate-500 py-12">
          {t('points.noPoints')}
        </div>
      )}

      <FloatingButton label={t('points.addPoint')} onClick={addPoint} />
    </div>
  )
}
