import { useState, useMemo } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useAppState, useDispatch } from '../../store/context'
import { useTeamStats } from '../../store/selectors'
import { computeGpi, GRADE_COLORS } from '../../lib/gpi'
import { buildShareText, copyToClipboard } from '../../lib/share'
import { CircularGauge } from '../ui/CircularGauge'
import { POSITIONS, POSITION_LABELS } from '../../types/player'

export function ProfileTab() {
  const t = useTranslation()
  const state = useAppState()
  const dispatch = useDispatch()
  const teamStats = useTeamStats(state)
  const gpi = useMemo(() => computeGpi(teamStats), [teamStats])
  const [copied, setCopied] = useState(false)

  const { profile } = state

  const updateProfile = (field: string, value: string) => {
    dispatch({ type: 'SET_PROFILE', field, value })
  }

  const share = async () => {
    const text = buildShareText(profile, gpi, teamStats)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Edit Profile */}
      <div className="bg-pb-card rounded-xl border border-pb-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-white">{t('profile.editProfile')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t('profile.name')}</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateProfile('name', e.target.value)}
              placeholder="Your name"
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white border border-pb-border focus:border-pb-amber outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t('profile.team')}</label>
            <input
              type="text"
              value={profile.team}
              onChange={(e) => updateProfile('team', e.target.value)}
              placeholder="Team name"
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white border border-pb-border focus:border-pb-amber outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t('profile.position')}</label>
            <select
              value={profile.position}
              onChange={(e) => updateProfile('position', e.target.value)}
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white border border-pb-border outline-none"
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">{t('profile.division')}</label>
            <select
              value={profile.division}
              onChange={(e) => updateProfile('division', e.target.value)}
              className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white border border-pb-border outline-none"
            >
              {['D5', 'D4', 'D3', 'D2', 'D1', 'Semi-Pro', 'Pro'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-pb-card rounded-xl border border-pb-border p-4">
        <h3 className="text-sm font-bold text-white mb-4">{t('profile.statsCard')}</h3>
        <div className="flex items-center gap-4">
          <CircularGauge value={gpi.overall} grade={gpi.grade} size={100} />
          <div className="flex-1">
            <div className="text-lg font-bold text-white">{profile.name || 'Player'}</div>
            <div className="text-xs text-slate-400">{profile.team || 'Team'}</div>
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-pb-amber/20 text-pb-amber px-2 py-0.5 rounded">
                {POSITION_LABELS[profile.position as keyof typeof POSITION_LABELS] || profile.position}
              </span>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                {profile.division}
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <StatBox label="W/L" value={`${teamStats.wins}/${teamStats.losses}`} />
          <StatBox label="SUR%" value={`${teamStats.survivalPct}%`} />
          <StatBox label="K/PT" value={`${teamStats.killsPP}`} />
          <StatBox label="COM" value={`${teamStats.avgComm}`} />
        </div>

        {/* GPI tier label */}
        <div className="mt-4 text-center">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              backgroundColor: GRADE_COLORS[gpi.grade] + '20',
              color: GRADE_COLORS[gpi.grade],
            }}
          >
            {t(`gpi.${gpi.grade}`)} — GPI {gpi.overall}
          </span>
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={share}
          className="w-full mt-4 bg-pb-amber text-black font-bold py-3 rounded-lg hover:bg-yellow-400 active:scale-95 transition-all"
        >
          {copied ? t('profile.copied') : t('profile.share')}
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-700/50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-sm text-white font-mono font-bold">{value}</div>
    </div>
  )
}
