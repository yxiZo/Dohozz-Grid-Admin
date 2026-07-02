'use client'

import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
  const handleDelete = () => {
    onOpenChange(false)
    showSubmittedData(currentRow, '以下权限已被删除：')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
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
