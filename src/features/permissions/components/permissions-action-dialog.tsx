'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { modules, permissionTypes } from '../data/data'
import { type Permission } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, '请输入权限名称。'),
  code: z
    .string()
    .min(1, '请输入权限编码。')
    .regex(/^[a-z0-9]+:[a-z0-9-]+$/, '编码格式应为 模块:操作，如 user:view。'),
  module: z.string().min(1, '请选择所属模块。'),
  type: z.string().min(1, '请选择权限类型。'),
  description: z.string().optional(),
})
type PermissionForm = z.infer<typeof formSchema>

type Props = {
  currentRow?: Permission
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PermissionsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!currentRow
  const form = useForm<PermissionForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          code: currentRow.code,
          module: currentRow.module,
          type: currentRow.type,
          description: currentRow.description ?? '',
        }
      : { name: '', code: '', module: '', type: '', description: '' },
  })

  const onSubmit = (values: PermissionForm) => {
    form.reset()
    showSubmittedData(values, isEdit ? '已更新权限：' : '已新增权限：')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑权限' : '新增权限'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改权限点信息。' : '创建一个新的权限点。'}
            完成后点击保存。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='permission-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>权限名称</FormLabel>
                  <FormControl>
                    <Input placeholder='例如：查看用户' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>权限编码</FormLabel>
                  <FormControl>
                    <Input placeholder='例如：user:view' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='module'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所属模块</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='选择所属模块'
                    items={modules.map((m) => ({ ...m }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>权限类型</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='选择权限类型'
                    items={permissionTypes.map((t) => ({ ...t }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='权限说明（选填）'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='permission-form'>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
