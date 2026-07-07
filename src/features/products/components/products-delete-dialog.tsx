'use client'

import { AlertTriangle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteProduct } from '@/services/products'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ProductRow } from '../data/schema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ProductRow
}

export function ProductsDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteProduct(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`产品「${currentRow.sku}」已删除。`)
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
          删除产品
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            确定要删除 SKU <span className='font-bold'>{currentRow.sku}</span>
            （品牌：{currentRow.brandName}）吗？
            <br />
            删除为软删除，相同品牌下的 SKU 后续可恢复。
          </p>
          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>
              该产品的扩展属性将一并从列表中移除，请谨慎操作。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
