import { api, type ApiResponse } from '@/lib/api'
import type { Role } from '@/features/roles/data/schema'

export type RolePayload = {
  name: string
  code: string
  description: string
  status: Role['status']
}

export async function getRoles() {
  const res = await api.get<ApiResponse<Role[]>>('/roles')
  return res.data.data
}

export async function createRole(payload: RolePayload) {
  const res = await api.post<ApiResponse<Role>>('/roles', payload)
  return res.data.data
}

export async function updateRole(id: string, payload: RolePayload) {
  const res = await api.put<ApiResponse<Role>>(`/roles/${id}`, payload)
  return res.data.data
}

export async function updateRolePermissions(id: string, permissions: string[]) {
  const res = await api.put<ApiResponse<Role>>(`/roles/${id}/permissions`, {
    permissions,
  })
  return res.data.data
}

export async function deleteRole(id: string) {
  const res = await api.delete<ApiResponse<Role>>(`/roles/${id}`)
  return res.data.data
}
