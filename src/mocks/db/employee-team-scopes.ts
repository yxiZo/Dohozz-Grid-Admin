import type {
  EmployeeTeamScope,
  EmployeeTeamScopeInput,
} from '@/features/teams/data/schema'
import { mockCountries, mockTeams } from './teams'

// 员工团队范围按 employee_id 存储。key 为用户 id（复用 Users 模块的 user.id）。
const scopeStore = new Map<string, EmployeeTeamScope[]>()

let nextScopeId = 1

function findTeam(teamId: number) {
  return mockTeams.find((t) => t.id === teamId) ?? null
}

function findCountry(countryId: number | null) {
  if (countryId === null) return null
  return mockCountries.find((c) => c.id === countryId) ?? null
}

export function getEmployeeScopes(employeeId: string): EmployeeTeamScope[] {
  return scopeStore.get(employeeId) ?? []
}

export function setEmployeeScopes(
  employeeId: string,
  employeeName: string,
  inputs: EmployeeTeamScopeInput[]
): EmployeeTeamScope[] {
  const scopes: EmployeeTeamScope[] = inputs.map((input) => {
    const team = findTeam(input.team_id)
    const country = findCountry(input.country_id)
    return {
      id: nextScopeId++,
      employee_id: employeeId,
      employee_name: employeeName,
      team_id: input.team_id,
      team_name: team?.team_name ?? '',
      country_id: input.country_id,
      country_code: country?.country_code ?? null,
      country_name: country?.country_name ?? null,
      status: 1,
      effective_start: input.effective_start,
      effective_end: input.effective_end,
    }
  })
  scopeStore.set(employeeId, scopes)
  return scopes
}
