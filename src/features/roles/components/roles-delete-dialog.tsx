'use client'

import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteRole } from '@/services/roles'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Role } from '../data/schema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Role
}

export function RolesDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const hasUsers = currentRow.userCount > 0
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteRole(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(`角色「${currentRow.name}」已删除。`)
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
      disabled={hasUsers || isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除角色
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确定要删除角色{' '}
            <span className='font-bold'>{currentRow.name}</span>（
            <code>{currentRow.code}</code>）吗？
            <br />
            该操作不可撤销。
          </p>
          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>
              {hasUsers
                ? `该角色下仍有 ${currentRow.userCount} 名用户，请先转移用户后再删除。`
                : '请谨慎操作，该操作无法回滚。'}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
