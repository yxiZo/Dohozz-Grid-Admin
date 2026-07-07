import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { productStatuses, productStatusStyles } from '../data/data'
import { type ProductRow } from '../data/schema'
import { ProductsRowActions } from './products-row-actions'

export const productsColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: 'sku',
    header: ({ column }) => <DataTableColumnHeader column={column} title='SKU' />,
    cell: ({ row }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs font-medium'>
        {row.getValue('sku')}
      </code>
    ),
    meta: { className: 'min-w-36' },
    enableHiding: false,
  },
  {
    accessorKey: 'productName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产品名称' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-64 font-medium'>
        {row.original.productName || '—'}
      </LongText>
    ),
    meta: { className: 'min-w-52' },
    enableSorting: false,
  },
  {
    accessorKey: 'brandId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='品牌' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.brandName}</span>
        <span className='text-xs text-muted-foreground'>
          {row.original.brandCode}
        </span>
      </div>
    ),
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    enableSorting: false,
  },
  {
    accessorKey: 'seriesId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='系列' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span>{row.original.seriesName}</span>
        <span className='text-xs text-muted-foreground'>
          {row.original.seriesCode}
        </span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'teamId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='归属团队' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{row.original.teamName}</span>
    ),
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    enableSorting: false,
  },
  {
    id: 'attrs',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='规格属性' />
    ),
    cell: ({ row }) => {
      const attrs = row.original.attrs
      if (!attrs.length) return <span className='text-muted-foreground'>—</span>
      return (
        <div className='flex max-w-56 flex-wrap gap-1'>
          {attrs.map((a) => (
            <Badge key={a.id} variant='secondary' className='font-normal'>
              {a.key}: {a.value}
            </Badge>
          ))}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as ProductRow['status']
      const label =
        productStatuses.find((s) => s.value === status)?.label ?? status
      return (
        <Badge variant='outline' className={cn(productStatusStyles.get(status))}>
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ProductsRowActions,
  },
]
