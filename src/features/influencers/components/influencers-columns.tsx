import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  PlatformLogo,
  type Platform,
} from '@/assets/brand-icons/platform-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
  contactChannels,
  formatFollowers,
  influencerSources,
  influencerStatuses,
  influencerStatusStyles,
  platforms,
} from '../data/data'
import { type Influencer } from '../data/schema'
import { InfluencersRowActions } from './influencers-row-actions'

export const influencersColumns: ColumnDef<Influencer>[] = [
  {
    accessorKey: 'displayName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='达人' />
    ),
    cell: ({ row }) => {
      const { displayName, handle, avatarUrl } = row.original
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='size-9'>
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>{displayName}</span>
            {handle && (
              <span className='text-xs text-muted-foreground'>@{handle}</span>
            )}
          </div>
        </div>
      )
    },
    meta: { className: 'min-w-52' },
    enableHiding: false,
  },
  {
    accessorKey: 'platformId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='平台' />
    ),
    cell: ({ row }) => {
      const platformId = row.getValue('platformId') as Platform
      const label =
        platforms.find((p) => p.value === platformId)?.label ?? platformId
      return (
        <div className='flex items-center gap-2'>
          <PlatformLogo platform={platformId} size={20} variant='chip' />
          <span>{label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'platformUid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='平台 UID' />
    ),
    cell: ({ row }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
        {row.getValue('platformUid')}
      </code>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'countryId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='国家/地区' />
    ),
    cell: ({ row }) => <span>{row.original.countryName}</span>,
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    enableSorting: false,
  },
  {
    accessorKey: 'followerCountSnapshot',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='粉丝数' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatFollowers(row.original.followerCountSnapshot)}
      </span>
    ),
  },
  {
    id: 'contacts',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='主联系方式' />
    ),
    cell: ({ row }) => {
      const primary =
        row.original.contacts.find((c) => c.isPrimary) ??
        row.original.contacts[0]
      if (!primary) return <span className='text-muted-foreground'>—</span>
      const channel = contactChannels.find((c) => c.value === primary.channelId)
      const Icon = channel?.icon
      return (
        <div className='flex items-center gap-2'>
          {Icon && <Icon className='size-4 text-muted-foreground' />}
          <LongText className='max-w-40 text-muted-foreground'>
            {primary.value}
          </LongText>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='来源' />
    ),
    cell: ({ row }) => {
      const source = row.getValue('source') as Influencer['source']
      const label = influencerSources.find((s) => s.value === source)?.label
      return (
        <span className='text-muted-foreground'>{label ?? '—'}</span>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as Influencer['status']
      const label =
        influencerStatuses.find((s) => s.value === status)?.label ?? status
      return (
        <Badge
          variant='outline'
          className={cn(influencerStatusStyles.get(status))}
        >
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: InfluencersRowActions,
  },
]
