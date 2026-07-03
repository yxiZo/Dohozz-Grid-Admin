import { api, type ApiResponse } from '@/lib/api'
import type {
  EmployeeTeamScope,
  EmployeeTeamScopeInput,
  Team,
} from '@/features/teams/data/schema'

export async function getTeams() {
  const res = await api.get<ApiResponse<Team[]>>('/teams')
  return res.data.data
}

export async function getEmployeeTeamScopes(employeeId: string) {
  const res = await api.get<ApiResponse<EmployeeTeamScope[]>>(
    '/employee-team-scopes',
    { params: { employee_id: employeeId } }
  )
  return res.data.data
}

export async function updateEmployeeTeamScopes(
  employeeId: string,
  employeeName: string,
  scopes: EmployeeTeamScopeInput[]
) {
  const res = await api.put<ApiResponse<EmployeeTeamScope[]>>(
    `/employee/${employeeId}/team-scopes`,
    { employee_name: employeeName, scopes }
  )
  return res.data.data
}
