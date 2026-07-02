import { api, type ApiResponse } from '@/lib/api'
import type { Role } from '@/features/roles/data/schema'

export async function getRoles() {
  const res = await api.get<ApiResponse<Role[]>>('/roles')
  return res.data.data
}
