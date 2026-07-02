'use client'

import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
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

  const handleDelete = () => {
    onOpenChange(false)
    showSubmittedData(currentRow, '以下角色已被删除：')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={hasUsers}
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
