import { api, type ApiResponse } from '@/lib/api'

export type LoginPayload = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  exp: string
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/login', payload)
  return data.data
}

export async function getCurrentUser() {
  const { data } = await api.get<ApiResponse<unknown>>('/getInfo')
  return data.data
}
