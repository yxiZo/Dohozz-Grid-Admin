import { http, HttpResponse } from 'msw'
import type { Permission } from '@/features/permissions/data/schema'
import { moduleNameMap } from '@/features/permissions/data/data'
import { mockPermissions } from '../db/permissions'

type PermissionBody = {
  name: string
  code: string
  module: string
  type: Permission['type']
  description?: string
}

export const permissionHandlers = [
  http.get('/api/permissions', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockPermissions,
    })
  }),

  http.post('/api/permissions', async ({ request }) => {
    const body = (await request.json()) as PermissionBody
    const permission: Permission = {
      id: body.code,
      name: body.name,
      code: body.code,
      module: body.module,
      moduleName: moduleNameMap[body.module] ?? body.module,
      type: body.type,
      description: body.description,
      createdAt: new Date(),
    }
    mockPermissions.push(permission)
    return HttpResponse.json({ code: 0, message: 'success', data: permission })
  }),

  http.put('/api/permissions/:id', async ({ params, request }) => {
    const body = (await request.json()) as PermissionBody
    const permission = mockPermissions.find((p) => p.id === params.id)
    if (!permission) {
      return HttpResponse.json(
        { code: 404, message: '权限不存在', data: null },
        { status: 404 }
      )
    }
    permission.name = body.name
    permission.code = body.code
    permission.module = body.module
    permission.moduleName = moduleNameMap[body.module] ?? body.module
    permission.type = body.type
    permission.description = body.description
    return HttpResponse.json({ code: 0, message: 'success', data: permission })
  }),

  http.delete('/api/permissions/:id', ({ params }) => {
    const index = mockPermissions.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: '权限不存在', data: null },
        { status: 404 }
      )
    }
    const [removed] = mockPermissions.splice(index, 1)
    return HttpResponse.json({ code: 0, message: 'success', data: removed })
  }),
]
