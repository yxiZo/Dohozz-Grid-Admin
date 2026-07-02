import { api, type ApiResponse } from '@/lib/api'
import type { Permission } from '@/features/permissions/data/schema'

export type PermissionPayload = {
  name: string
  code: string
  module: string
  type: Permission['type']
  description?: string
}

export async function getPermissions() {
  const res = await api.get<ApiResponse<Permission[]>>('/permissions')
  return res.data.data
}

export async function createPermission(payload: PermissionPayload) {
  const res = await api.post<ApiResponse<Permission>>('/permissions', payload)
  return res.data.data
}

export async function updatePermission(id: string, payload: PermissionPayload) {
  const res = await api.put<ApiResponse<Permission>>(
    `/permissions/${id}`,
    payload
  )
  return res.data.data
}

export async function deletePermission(id: string) {
  const res = await api.delete<ApiResponse<Permission>>(`/permissions/${id}`)
  return res.data.data
}
