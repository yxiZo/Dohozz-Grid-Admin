import { http, HttpResponse } from 'msw'
import { mockRoles } from '../db/roles'

export const roleHandlers = [
  http.get('/api/roles', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockRoles,
    })
  }),
]
