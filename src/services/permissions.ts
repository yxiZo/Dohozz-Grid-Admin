import { api, type ApiResponse } from '@/lib/api'
import type { Permission } from '@/features/permissions/data/schema'

export async function getPermissions() {
  const res = await api.get<ApiResponse<Permission[]>>('/permissions')
  return res.data.data
}
