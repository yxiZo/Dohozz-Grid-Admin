import type {
  EmployeeTeamScope,
  EmployeeTeamScopeInput,
} from '@/features/teams/data/schema'
import { mockUsers } from './users'
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

// ---- 预置示例数据 ----------------------------------------------------------
// 为前若干名用户预置团队/国家范围，方便直接在界面上看到数据。
// 每个团队覆盖的国家（与 teams mock 保持一致）。
const teamCountryIds: Record<number, number[]> = {
  1: [1, 3], // Team A: 马来西亚、泰国
  2: [4, 3], // Team B: 越南、泰国
  3: [2, 5, 6], // 外部中台团队: 印尼、菲律宾、新加坡
}

function seedInitialScopes() {
  const seedUsers = mockUsers.slice(0, 30)
  const today = new Date()
  const start = new Date(today.getFullYear(), 0, 1)
    .toISOString()
    .slice(0, 10)

  seedUsers.forEach((user, index) => {
    const name =
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      user.username

    // 全量权限角色（superadmin）不配置范围，界面会展示豁免提示。
    if (user.role === 'superadmin') return

    const inputs: EmployeeTeamScopeInput[] = []

    // 第一条：主团队 + 一个具体国家。
    const primaryTeam = ((index % 3) + 1) as 1 | 2 | 3
    const primaryCountries = teamCountryIds[primaryTeam]
    inputs.push({
      team_id: primaryTeam,
      country_id: primaryCountries[index % primaryCountries.length],
      effective_start: start,
      effective_end: null,
    })

    // 每隔一个用户追加第二条：另一团队的「全部国家」范围。
    if (index % 2 === 0) {
      const secondaryTeam = ((primaryTeam % 3) + 1) as 1 | 2 | 3
      inputs.push({
        team_id: secondaryTeam,
        country_id: null, // 全部国家
        effective_start: start,
        effective_end: null,
      })
    }

    setEmployeeScopes(user.id, name, inputs)
  })
}

seedInitialScopes()
