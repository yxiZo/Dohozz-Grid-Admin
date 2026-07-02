import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { moduleMeta, permissionTypeStyles, permissionTypes } from '../data/data'
import { type Permission } from '../data/schema'
import { PermissionsRowActions } from './permissions-row-actions'

export const permissionsColumns: ColumnDef<Permission>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='权限名称' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-1 font-medium'>
        {row.getValue('name')}
      </LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='权限编码' />
    ),
    cell: ({ row }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
        {row.getValue('code')}
      </code>
    ),
  },
  {
    accessorKey: 'module',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='所属模块' />
    ),
    cell: ({ row }) => {
      const module = row.getValue('module') as string
      const meta = moduleMeta[module]
      const Icon = meta?.icon
      return (
        <div className='flex items-center gap-x-2'>
          {Icon && <Icon size={16} className='text-muted-foreground' />}
          <span className='text-sm'>{meta?.label ?? module}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='类型' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as Permission['type']
      const label = permissionTypes.find((t) => t.value === type)?.label ?? type
      return (
        <Badge
          variant='outline'
          className={cn(permissionTypeStyles.get(type))}
        >
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='描述' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-60 text-muted-foreground'>
        {row.getValue('description') || '-'}
      </LongText>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: PermissionsRowActions,
  },
]
