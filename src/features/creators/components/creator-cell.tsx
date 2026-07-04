import { type ICellRendererParams } from 'ag-grid-community'
import { Users, Mail, TrendingUp, Pencil, Gavel, Lock } from 'lucide-react'
import { PlatformLogo, type Platform } from '@/assets/brand-icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type Creator, reviewColorMap } from '../data/data'

export type CreatorGridContext = {
  onEditCreator: (creator: Creator) => void
  /** Opens the 提报审核 dialog. Only wired on the outreach stage. */
  onReviewCreator?: (creator: Creator) => void
  /** Whether the current user may perform 审核 (仅限特定人员). */
  canReview?: boolean
}

function initials(handle: string) {
  const h = handle.replace(/^@/, '').trim()
  return h.slice(0, 2).toUpperCase() || '?'
}

function formatFollower(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function InfoRow({
  icon: Icon,
  platform,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>
  platform?: Platform
  label: string
  value: string
}) {
  if (!value) return null
  return (
    <div className='flex items-center gap-2 text-sm'>
      {platform ? (
        <PlatformLogo platform={platform} size={22} variant='chip' />
      ) : Icon ? (
        <Icon className='text-muted-foreground size-3.5 shrink-0' />
      ) : null}
      <span className='text-muted-foreground w-20 shrink-0'>{label}</span>
      <span className='truncate'>{value}</span>
    </div>
  )
}

/**
 * 审核 column cell for the outreach stage.
 * - Shows the current review status (colored dot + label).
 * - Reviewers see an "审核" button that opens the review dialog.
 * - Non-reviewers see a lock icon; inline editing is disabled entirely,
 *   so the status can only be changed through the gated dialog.
 */
export function ReviewActionRenderer(params: ICellRendererParams<Creator>) {
  const creator = params.data
  const context = params.context as CreatorGridContext
  const status = (params.value as string) || '待审核'
  const color = reviewColorMap[status] ?? 'var(--muted-foreground)'

  return (
    <div className='flex h-full w-full items-center justify-between gap-2'>
      <span className='inline-flex items-center gap-2'>
        <span
          className='inline-block size-2 rounded-full'
          style={{ backgroundColor: color }}
        />
        {status}
      </span>

      {context.canReview ? (
        <button
          type='button'
          onClick={() => creator && context.onReviewCreator?.(creator)}
          className='text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors'
        >
          <Gavel className='size-3.5' />
          审核
        </button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='text-muted-foreground inline-flex items-center'>
              <Lock className='size-3.5' />
              <span className='sr-only'>仅审核人员可操作</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>仅审核人员可操作</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

/**
 * Creator column cell: avatar + TikTok ID.
 * - Hover shows an information card summarizing the creator.
 * - Click opens the edit dialog via grid context callback.
 */
export function CreatorCellRenderer(params: ICellRendererParams<Creator>) {
  const creator = params.data
  if (!creator) return null
  const context = params.context as CreatorGridContext

  return (
    <HoverCard openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type='button'
          onClick={() => context.onEditCreator(creator)}
          className='group flex h-full w-full items-center gap-2 text-start'
        >
          <Avatar className='size-7'>
            <AvatarFallback className='bg-primary/10 text-primary text-[11px] font-medium'>
              {initials(creator.tiktokId)}
            </AvatarFallback>
          </Avatar>
          <span className='truncate font-medium group-hover:underline'>
            {creator.tiktokId}
          </span>
          <Pencil className='text-muted-foreground ms-auto size-3.5 opacity-0 transition-opacity group-hover:opacity-100' />
        </button>
      </HoverCardTrigger>
      <HoverCardContent align='start' className='w-80'>
        <div className='flex items-start gap-3'>
          <Avatar className='size-11'>
            <AvatarFallback className='bg-primary/10 text-primary font-medium'>
              {initials(creator.tiktokId)}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <p className='truncate font-semibold'>{creator.tiktokId}</p>
              <Badge variant='secondary' className='font-normal'>
                {creator.contentCategory}
              </Badge>
            </div>
            <p className='text-muted-foreground flex items-center gap-1 text-sm'>
              <Users className='size-3.5' />
              {formatFollower(creator.follower)} · {creator.followerTier}
            </p>
          </div>
        </div>

        <div className='bg-muted/50 my-3 grid grid-cols-3 gap-2 rounded-md p-2 text-center'>
          <div>
            <p className='text-muted-foreground text-xs'>GMV</p>
            <p className='text-sm font-semibold'>
              ${creator.gmv.toLocaleString('en-US')}
            </p>
          </div>
          <div>
            <p className='text-muted-foreground text-xs'>履约率</p>
            <p className='text-sm font-semibold'>
              {Math.round(creator.fulfilledRate * 100)}%
            </p>
          </div>
          <div>
            <p className='text-muted-foreground text-xs'>视频</p>
            <p className='text-sm font-semibold'>
              {creator.completedVideos}/{creator.agreedVideos}
            </p>
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <InfoRow icon={TrendingUp} label='合作类型' value={creator.collabType} />
          <InfoRow platform='tiktok' label='TikTok' value={creator.tiktokId} />
          <InfoRow icon={Mail} label='Email' value={creator.email} />
          <InfoRow
            platform='whatsapp'
            label='Whatsapp'
            value={creator.whatsapp}
          />
          <InfoRow
            platform='instagram'
            label='Instagram'
            value={creator.instagram}
          />
          <InfoRow
            platform='facebook'
            label='Facebook'
            value={creator.facebook}
          />
        </div>

        <button
          type='button'
          onClick={() => context.onEditCreator(creator)}
          className='text-primary mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border py-1.5 text-sm hover:underline'
        >
          <Pencil className='size-3.5' />
          编辑达人信息
        </button>
      </HoverCardContent>
    </HoverCard>
  )
}
