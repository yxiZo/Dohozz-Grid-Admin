import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type Creator, type ReviewStatus, reviewColorMap } from '../data/data'

export type ReviewDecision = {
  review: ReviewStatus
  notApprovalReason: string
}

type CreatorReviewDialogProps = {
  creator: Creator | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (creator: Creator, decision: ReviewDecision) => void
}

function initials(handle: string) {
  return (handle ?? '').replace(/^@/, '').trim().slice(0, 2).toUpperCase() || '?'
}

function formatFollower(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

type Choice = '已通过' | '未通过'

export function CreatorReviewDialog({
  creator,
  open,
  onOpenChange,
  onConfirm,
}: CreatorReviewDialogProps) {
  const [choice, setChoice] = useState<Choice | null>(null)
  const [reason, setReason] = useState('')

  if (!creator) return null

  const rejectionNeedsReason = choice === '未通过' && reason.trim().length === 0
  const canSubmit = choice !== null && !rejectionNeedsReason

  const handleConfirm = () => {
    if (!choice || rejectionNeedsReason) return
    onConfirm(creator, {
      review: choice,
      notApprovalReason: choice === '未通过' ? reason.trim() : '',
    })
    onOpenChange(false)
  }

  const currentColor = reviewColorMap[creator.review] ?? 'var(--muted-foreground)'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>提报审核</DialogTitle>
          <DialogDescription>
            审核该达人的建联提报，通过或退回并填写原因。
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-5'>
          {/* Creator summary */}
          <div className='flex items-center gap-3 rounded-lg border p-3'>
            <Avatar className='size-11'>
              <AvatarFallback className='bg-primary/10 font-medium text-primary'>
                {initials(creator.tiktokId)}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <p className='truncate font-semibold'>{creator.tiktokId}</p>
                {creator.contentCategory && (
                  <Badge variant='secondary' className='font-normal'>
                    {creator.contentCategory}
                  </Badge>
                )}
              </div>
              <p className='text-muted-foreground text-sm'>
                {formatFollower(creator.follower)} 粉丝 · BD {creator.bd || '—'}
              </p>
            </div>
            <div className='text-end'>
              <p className='text-muted-foreground text-xs'>当前状态</p>
              <span className='inline-flex items-center gap-1.5 text-sm font-medium'>
                <span
                  className='inline-block size-2 rounded-full'
                  style={{ backgroundColor: currentColor }}
                />
                {creator.review}
              </span>
            </div>
          </div>

          {/* Decision */}
          <div className='flex flex-col gap-2'>
            <Label className='text-muted-foreground text-xs'>审核结果</Label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => setChoice('已通过')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                  choice === '已通过'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                    : 'hover:bg-accent'
                )}
              >
                <Check className='size-4' />
                通过
              </button>
              <button
                type='button'
                onClick={() => setChoice('未通过')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                  choice === '未通过'
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'hover:bg-accent'
                )}
              >
                <X className='size-4' />
                未通过
              </button>
            </div>
          </div>

          {/* Rejection reason (required when 未通过) */}
          {choice === '未通过' && (
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='review-reason' className='text-muted-foreground text-xs'>
                未通过原因<span className='text-destructive'> *</span>
              </Label>
              <Textarea
                id='review-reason'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='请说明退回原因，便于 BD 修改后再次提报'
                rows={3}
                autoFocus
              />
              {rejectionNeedsReason && (
                <p className='text-destructive text-xs'>未通过时必须填写原因</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit}>
            确认审核
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
