import { useAppState } from '../store/context'

export function useDummyData() {
  const { points } = useAppState()
  return {
    hasDummyData: points.some((p) => p.isDummyData),
    dummyCount: points.filter((p) => p.isDummyData).length,
  }
}
