import type { AppState } from './context'
import { createDefaultOnboarding } from '../types/onboarding'
import { createDefaultChallengesState } from '../types/challenges'
import { createDefaultPersona } from '../types/persona'

const STORAGE_KEY = 'ppi-paintball-trainer'
const SCHEMA_VERSION = 2

interface StorageSchema {
  version: number
  state: AppState
  savedAt: string
}

export function saveState(state: AppState): void {
  try {
    const data: StorageSchema = {
      version: SCHEMA_VERSION,
      state,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data: StorageSchema = JSON.parse(raw)
    if (data.version === 1) {
      // Migrate v1 -> v2: add new fields
      const migrated: AppState = {
        ...data.state,
        activeSection: 'home',
        onboarding: createDefaultOnboarding(),
        challengesState: createDefaultChallengesState(),
        personaState: createDefaultPersona(),
      }
      return migrated
    }
    if (data.version !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return data.state
  } catch {
    return null
  }
}
