import { api, type ApiResponse } from '@/lib/api'
import type { Task } from '@/features/tasks/data/schema'

export async function getTasks() {
  const res = await api.get<ApiResponse<Task[]>>('/tasks')
  return res.data.data
}

