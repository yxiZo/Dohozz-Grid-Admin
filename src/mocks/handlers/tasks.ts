import { http, HttpResponse } from 'msw'
import { mockTasks } from '../db/tasks'

export const taskHandlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockTasks,
    })
  }),
]

