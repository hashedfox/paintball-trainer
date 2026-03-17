import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useTranslation } from '../../i18n/useTranslation'
import { useAppState, useDispatch } from '../../store/context'
import { POSITIONS, POSITION_LABELS, type Position } from '../../types/player'

export function RosterManager() {
  const t = useTranslation()
  const { roster } = useAppState()
  const dispatch = useDispatch()
  const [newName, setNewName] = useState('')

  const addPlayer = () => {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_PLAYER',
      player: { id: nanoid(), name: newName.trim(), position: 'centre' as Position },
    })
    setNewName('')
  }

  return (
    <section>
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{t('setup.roster')}</h2>
      <div className="space-y-2 mb-3">
        {roster.map((player) => (
          <div key={player.id} className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
            <input
              type="text"
              value={player.name}
              onChange={(e) => dispatch({ type: 'UPDATE_PLAYER_NAME', playerId: player.id, name: e.target.value })}
              className="flex-1 bg-transparent text-white outline-none min-w-0"
            />
            <select
              value={player.position}
              onChange={(e) => dispatch({ type: 'UPDATE_PLAYER_POSITION', playerId: player.id, position: e.target.value as Position })}
              className="bg-slate-600 text-xs text-slate-200 rounded px-2 py-1 outline-none"
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => dispatch({ type: 'REMOVE_PLAYER', playerId: player.id })}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          placeholder={t('setup.playerName')}
          className="flex-1 bg-slate-700 rounded-lg px-3 py-2 text-white border border-white/[0.08] focus:border-[#D4A843] outline-none"
        />
        <button
          type="button"
          onClick={addPlayer}
          className="bg-[#D4A843] text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-400"
        >
          +
        </button>
      </div>
    </section>
  )
}
