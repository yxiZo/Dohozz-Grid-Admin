'use client'

import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteInfluencer } from '@/services/influencers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Influencer } from '../data/schema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Influencer
}

export function InfluencersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteInfluencer(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] })
      toast.success(`达人「${currentRow.displayName}」已删除。`)
      onOpenChange(false)
    },
    onError: () => toast.error('删除失败，请稍后重试。'),
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => mutate()}
      disabled={isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除达人
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确定要删除达人{' '}
            <span className='font-bold'>{currentRow.displayName}</span>
            （平台 UID：<code>{currentRow.platformUid}</code>）吗？
            <br />
            删除为软删除，相同平台 UID 后续可恢复。
          </p>
          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>
              该达人的联系方式将一并从列表中移除，请谨慎操作。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
