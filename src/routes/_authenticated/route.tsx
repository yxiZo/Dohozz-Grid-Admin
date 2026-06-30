import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { accessToken } = useAuthStore.getState().auth
    // 未登录则重定向到登录页，并带上当前地址用于登录后跳回
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})
