import { create } from 'zustand'

const SELECTED_TEAM_KEY = 'dohozz.selectedTeamId'

function readInitialTeamId(): number | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SELECTED_TEAM_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

interface TeamState {
  /** 当前选中的团队 id，null 表示尚未初始化 */
  selectedTeamId: number | null
  setSelectedTeamId: (teamId: number) => void
}

export const useTeamStore = create<TeamState>()((set) => ({
  selectedTeamId: readInitialTeamId(),
  setSelectedTeamId: (teamId) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SELECTED_TEAM_KEY, String(teamId))
    }
    set({ selectedTeamId: teamId })
  },
}))
