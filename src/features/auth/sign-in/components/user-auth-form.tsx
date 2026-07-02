import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { loginWithMock } from '../mock-auth'

const formSchema = z.object({
  username: z
    .string()
    .min(1, '请输入手机号')
    .regex(/^1\d{10}$/, '手机号格式不正确'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码长度不能少于 6 位')
    .max(20, '密码长度不能超过 20 位'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await loginWithMock(data)
      auth.setUser({
        accountNo: data.username,
        email: '',
        role: [],
        exp: new Date(result.exp).getTime(),
      })
      auth.setAccessToken(result.token)
      toast.success('登录成功')
      navigate({ to: redirectTo || '/', replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-6', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel>手机号</FormLabel>
              <FormControl>
                <Input
                  placeholder='请输入手机号'
                  autoComplete='username'
                  className='h-11'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <div className='flex items-center justify-between'>
                <FormLabel>密码</FormLabel>
                <Link
                  to='/forgot-password'
                  className='text-sm font-medium text-muted-foreground hover:opacity-75'
                >
                  忘记密码？
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  placeholder='请输入密码'
                  autoComplete='current-password'
                  className='h-11'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2 h-11' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          登录
        </Button>
      </form>
    </Form>
  )
}
