import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { roleStatuses, roleStatusStyles } from '../data/data'
import { type Role } from '../data/schema'
import { RolesRowActions } from './roles-row-actions'

export const rolesColumns: ColumnDef<Role>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色名称' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span className='font-medium'>{row.getValue('name')}</span>
        {row.original.isSystem && (
          <Badge variant='secondary' className='text-xs'>
            内置
          </Badge>
        )}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色编码' />
    ),
    cell: ({ row }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
        {row.getValue('code')}
      </code>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='描述' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-60 text-muted-foreground'>
        {row.getValue('description')}
      </LongText>
    ),
    enableSorting: false,
  },
  {
    id: 'permissionCount',
    accessorFn: (row) => row.permissions.length,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='权限数' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.permissions.length}</span>
    ),
  },
  {
    accessorKey: 'userCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户数' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.getValue('userCount')}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as Role['status']
      const label = roleStatuses.find((s) => s.value === status)?.label ?? status
      return (
        <Badge variant='outline' className={cn(roleStatusStyles.get(status))}>
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: RolesRowActions,
  },
]
