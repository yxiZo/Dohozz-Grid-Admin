import { http, HttpResponse } from 'msw'
import type { Role } from '@/features/roles/data/schema'
import { mockRoles } from '../db/roles'

type RoleBody = {
  name: string
  code: string
  description: string
  status: Role['status']
}

export const roleHandlers = [
  http.get('/api/roles', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockRoles,
    })
  }),

  http.post('/api/roles', async ({ request }) => {
    const body = (await request.json()) as RoleBody
    const now = new Date()
    const role: Role = {
      id: crypto.randomUUID(),
      name: body.name,
      code: body.code,
      description: body.description,
      status: body.status,
      permissions: [],
      userCount: 0,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    }
    mockRoles.unshift(role)
    return HttpResponse.json({ code: 0, message: 'success', data: role })
  }),

  http.put('/api/roles/:id', async ({ params, request }) => {
    const body = (await request.json()) as RoleBody
    const role = mockRoles.find((r) => r.id === params.id)
    if (!role) {
      return HttpResponse.json(
        { code: 404, message: '角色不存在', data: null },
        { status: 404 }
      )
    }
    role.name = body.name
    if (!role.isSystem) role.code = body.code
    role.description = body.description
    role.status = body.status
    role.updatedAt = new Date()
    return HttpResponse.json({ code: 0, message: 'success', data: role })
  }),

  http.put('/api/roles/:id/permissions', async ({ params, request }) => {
    const body = (await request.json()) as { permissions: string[] }
    const role = mockRoles.find((r) => r.id === params.id)
    if (!role) {
      return HttpResponse.json(
        { code: 404, message: '角色不存在', data: null },
        { status: 404 }
      )
    }
    role.permissions = body.permissions
    role.updatedAt = new Date()
    return HttpResponse.json({ code: 0, message: 'success', data: role })
  }),

  http.delete('/api/roles/:id', ({ params }) => {
    const index = mockRoles.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: '角色不存在', data: null },
        { status: 404 }
      )
    }
    if (mockRoles[index].isSystem) {
      return HttpResponse.json(
        { code: 400, message: '内置角色不可删除', data: null },
        { status: 400 }
      )
    }
    const [removed] = mockRoles.splice(index, 1)
    return HttpResponse.json({ code: 0, message: 'success', data: removed })
  }),
]
