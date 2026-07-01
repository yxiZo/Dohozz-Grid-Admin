import { api, type ApiResponse } from '@/lib/api'

export type LoginPayload = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  exp: string
}

/**
 * 本地测试账号
 * 当填写下面的手机号 + 密码时，会跳过真实接口请求，
 * 直接返回一个本地 token，方便在没有后端的情况下走通
 * 登录 -> 重定向 -> dashboard 的完整流程。
 *
 * 手机号：13800138000
 * 密码：  123456
 */
export const TEST_ACCOUNT = {
  username: '13800138000',
  password: '123456',
}

function createMockLoginResponse(): LoginResponse {
  // token 7 天后过期
  const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return {
    token: `local-test-token.${Date.now()}`,
    exp: exp.toISOString(),
  }
}

export async function login(payload: LoginPayload) {
  // 命中本地测试账号时直接返回 mock 数据，不发起网络请求
  if (
    payload.username === TEST_ACCOUNT.username &&
    payload.password === TEST_ACCOUNT.password
  ) {
    return createMockLoginResponse()
  }

  const { data } = await api.post<ApiResponse<LoginResponse>>('/login', payload)
  return data.data
}

export async function getCurrentUser() {
  const { data } = await api.get<ApiResponse<unknown>>('/getInfo')
  return data.data
}
