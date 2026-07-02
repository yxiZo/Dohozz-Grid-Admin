import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='w-[min(100%,26rem)] gap-8 py-10'>
        <CardHeader className='gap-2.5 px-10 text-center'>
          <CardTitle className='text-2xl font-semibold tracking-tight'>
            登录
          </CardTitle>
          <CardDescription className='leading-6 text-balance'>
            使用手机号和密码登录后台管理系统。
          </CardDescription>
        </CardHeader>
        <CardContent className='px-10'>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
