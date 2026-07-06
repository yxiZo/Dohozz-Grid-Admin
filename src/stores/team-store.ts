import { create } from 'zustand'

const SELECTED_TEAM_KEY = 'dohozz.selectedTeamId'
const SELECTED_COUNTRY_KEY = 'dohozz.selectedCountryId'

function readNumberFromStorage(key: string): number | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(key)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

interface TeamState {
  /** 当前选中的团队 id，null 表示尚未初始化 */
  selectedTeamId: number | null
  /** 当前选中的国家 id，null 表示该团队下全部国家（或团队无国家） */
  selectedCountryId: number | null
  /** 选择最终生效的团队 + 国家 */
  setSelection: (teamId: number, countryId: number | null) => void
}

export const useTeamStore = create<TeamState>()((set) => ({
  selectedTeamId: readNumberFromStorage(SELECTED_TEAM_KEY),
  selectedCountryId: readNumberFromStorage(SELECTED_COUNTRY_KEY),
  setSelection: (teamId, countryId) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SELECTED_TEAM_KEY, String(teamId))
      if (countryId == null) {
        window.localStorage.removeItem(SELECTED_COUNTRY_KEY)
      } else {
        window.localStorage.setItem(SELECTED_COUNTRY_KEY, String(countryId))
      }
    }
    set({ selectedTeamId: teamId, selectedCountryId: countryId })
  },
}))
