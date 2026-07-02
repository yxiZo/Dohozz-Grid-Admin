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
      <Card className='w-[min(100%,28rem)] gap-7 py-8'>
        <CardHeader className='gap-2 px-8'>
          <CardTitle className='text-2xl tracking-tight'>登录</CardTitle>
          <CardDescription className='leading-6'>
            使用手机号和密码登录后台管理系统。
          </CardDescription>
        </CardHeader>
        <CardContent className='px-8'>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
