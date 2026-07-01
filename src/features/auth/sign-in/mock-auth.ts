export type LoginPayload = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  exp: string
}

export const MOCK_ACCOUNT = {
  username: '13800138000',
  password: '123456',
}

const MOCK_LATENCY = 300

function wait(ms = MOCK_LATENCY) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function createMockLoginResponse(payload: LoginPayload): LoginResponse {
  const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return {
    token: `mock-token.${payload.username}.${Date.now()}`,
    exp: exp.toISOString(),
  }
}

/**
 * View-only mock login.
 *
 * v0 should maintain UI only for now. Keep auth behavior local and deterministic;
 * do not call backend APIs until API integration is intentionally restored.
 */
export async function loginWithMock(payload: LoginPayload) {
  await wait()
  return createMockLoginResponse(payload)
}

export async function getMockCurrentUser() {
  await wait()
  return {
    accountNo: MOCK_ACCOUNT.username,
    email: '',
    role: ['admin'],
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }
}
