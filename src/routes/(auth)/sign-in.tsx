import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { SignIn } from '@/features/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    const { accessToken } = useAuthStore.getState().auth
    // 已登录用户访问登录页时直接跳转到目标地址或首页
    if (accessToken) {
      throw redirect({ to: search.redirect || '/' })
    }
  },
})
