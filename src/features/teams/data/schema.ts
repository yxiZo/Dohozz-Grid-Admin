// Team / country scope domain model.
//
// - `Team` 业务团队（或中台团队），每个团队覆盖多个国家。
// - `EmployeeTeamScope` 员工能看到的业务数据范围（团队 + 国家 + 有效期）。
//   country_id = null 表示该团队下所有国家。

export type TeamType = 'business' | 'middleware'

export type Country = {
  id: number
  country_code: string
  country_name: string
}

export type Team = {
  id: number
  team_name: string
  team_type: TeamType
  company_id: number
  status: number
  countries: Country[]
}

export type EmployeeTeamScope = {
  id: number
  employee_id: string
  employee_name: string
  team_id: number
  team_name: string
  /** null 表示该团队下所有国家 */
  country_id: number | null
  country_code: string | null
  country_name: string | null
  status: number
  /** ISO 字符串，null 表示立即/一直有效 */
  effective_start: string | null
  /** ISO 字符串，null 表示长期有效 */
  effective_end: string | null
}

/** 配置员工团队范围时提交的单条记录 */
export type EmployeeTeamScopeInput = {
  team_id: number
  /** null 表示该团队全部国家 */
  country_id: number | null
  effective_start: string | null
  effective_end: string | null
}
