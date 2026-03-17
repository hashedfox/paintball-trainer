import type { AppState } from './context'

const STORAGE_KEY = 'ppi-paintball-trainer'
const SCHEMA_VERSION = 1

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
    if (data.version !== SCHEMA_VERSION) {
      // Future: add migration logic here
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return data.state
  } catch {
    return null
  }
}
