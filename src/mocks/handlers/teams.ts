import { http, HttpResponse } from 'msw'
import type { EmployeeTeamScopeInput } from '@/features/teams/data/schema'
import {
  getEmployeeScopes,
  setEmployeeScopes,
} from '../db/employee-team-scopes'
import { mockTeams } from '../db/teams'

type TeamScopesBody = {
  employee_name?: string
  scopes: EmployeeTeamScopeInput[]
}

export const teamHandlers = [
  // 团队列表（含覆盖国家）
  http.get('/api/teams', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockTeams,
    })
  }),

  // 某员工的团队范围
  http.get('/api/employee-team-scopes', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employee_id') ?? ''
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: getEmployeeScopes(employeeId),
    })
  }),

  // 配置某员工的团队范围（整体替换）
  http.put('/api/employee/:id/team-scopes', async ({ params, request }) => {
    const body = (await request.json()) as TeamScopesBody
    const employeeId = String(params.id)

    // 同一员工、同一团队、同一国家范围不能重复
    const seen = new Set<string>()
    for (const scope of body.scopes) {
      const key = `${scope.team_id}-${scope.country_id ?? 'all'}`
      if (seen.has(key)) {
        return HttpResponse.json(
          { code: 400, message: '存在重复的团队/国家范围', data: null },
          { status: 400 }
        )
      }
      seen.add(key)
    }

    const saved = setEmployeeScopes(
      employeeId,
      body.employee_name ?? '',
      body.scopes
    )
    return HttpResponse.json({ code: 0, message: 'success', data: saved })
  }),
]
