import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

function normalizeApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (apiBaseUrl) return apiBaseUrl

  const apiHost = import.meta.env.VITE_API_HOST?.trim()
  const apiPrefix = import.meta.env.VITE_API_PREFIX?.trim() || '/api'

  if (!apiHost) return apiPrefix

  const normalizedHost = apiHost.replace(/\/+$/, '')
  const normalizedPrefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`

  return `${normalizedHost}${normalizedPrefix}`
}

export const api = axios.create({
  baseURL: normalizeApiBaseUrl(),
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}
