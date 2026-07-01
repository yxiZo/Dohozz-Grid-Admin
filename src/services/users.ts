import { api, type ApiResponse } from '@/lib/api'
import type { User } from '@/features/users/data/schema'

export async function getUsers() {
  const res = await api.get<ApiResponse<User[]>>('/users')
  return res.data.data
}

