import { http, HttpResponse } from 'msw'
import { mockUsers } from '../db/users'

export const userHandlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockUsers,
    })
  }),
]

