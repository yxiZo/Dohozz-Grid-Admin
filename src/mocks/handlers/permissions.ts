import { http, HttpResponse } from 'msw'
import { mockPermissions } from '../db/permissions'

export const permissionHandlers = [
  http.get('/api/permissions', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockPermissions,
    })
  }),
]
