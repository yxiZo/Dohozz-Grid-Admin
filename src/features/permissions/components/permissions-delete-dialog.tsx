'use client'

import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deletePermission } from '@/services/permissions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Permission } from '../data/schema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Permission
}

export function PermissionsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => deletePermission(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      toast.success(`权限「${currentRow.name}」已删除。`)
      onOpenChange(false)
    },
    onError: () => toast.error('删除失败，请稍后重试。'),
  })

  const handleDelete = () => mutate()

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除权限
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确定要删除权限{' '}
            <span className='font-bold'>{currentRow.name}</span>（
            <code>{currentRow.code}</code>）吗？
            <br />
            删除后关联该权限的角色将失去此权限，操作不可撤销。
          </p>
          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>
              请谨慎操作，该操作无法回滚。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
