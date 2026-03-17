import type { GpiResult } from '../types/analytics'
import type { TeamAggregate } from '../store/selectors'
import type { ProfileData } from '../store/context'

export function buildShareText(
  profile: ProfileData,
  gpi: GpiResult,
  stats: TeamAggregate
): string {
  return [
    `🎯 ${profile.name || 'Player'} — ${profile.team || 'Team'}`,
    `📊 GPI: ${gpi.overall} (${gpi.grade})`,
    `🏆 W/L: ${stats.wins}/${stats.losses} (${stats.winPct}%)`,
    `🛡️ Survival: ${stats.survivalPct}%`,
    `🏃 OTB: ${stats.otbPct}%`,
    `⚔️ Kills/Pt: ${stats.killsPP}`,
    `📢 Comms: ${stats.avgComm}/5`,
    ``,
    `Tracked with PPI — Paintball Player Index`,
  ].join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
