import { useCallback, useMemo, useState } from 'react'
import { Building2, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-provider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { type Lead, statusColorMap, statusOptions } from '../data/data'

function initials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  if (/[\u4e00-\u9fa5]/.test(trimmed)) return trimmed.slice(-2)
  return trimmed
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatAmount(value: number) {
  return `¥${Number(value || 0).toLocaleString('zh-CN')}`
}

type LeadsKanbanProps = {
  rows: Lead[]
  setRows: React.Dispatch<React.SetStateAction<Lead[]>>
}

export function LeadsKanban({ rows, setRows }: LeadsKanbanProps) {
  const { t } = useLanguage()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStatus, setOverStatus] = useState<string | null>(null)

  // Group leads into columns keyed by status.
  const columns = useMemo(() => {
    const map = new Map<string, Lead[]>()
    for (const status of statusOptions) map.set(status, [])
    for (const lead of rows) {
      if (!map.has(lead.status)) map.set(lead.status, [])
      map.get(lead.status)!.push(lead)
    }
    return map
  }, [rows])

  const onDrop = useCallback(
    (status: string) => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === draggingId && r.status !== status ? { ...r, status } : r
        )
      )
      setDraggingId(null)
      setOverStatus(null)
    },
    [draggingId, setRows]
  )

  return (
    <div className='flex flex-1 flex-col gap-3'>
      <p className='text-muted-foreground text-sm'>{t('leads.kanbanHint')}</p>
      <div className='flex flex-1 gap-4 overflow-x-auto pb-2'>
        {statusOptions.map((status) => {
          const items = columns.get(status) ?? []
          const total = items.reduce((sum, l) => sum + (l.amount || 0), 0)
          const color = statusColorMap[status] ?? 'var(--muted-foreground)'
          const isOver = overStatus === status
          return (
            <section
              key={status}
              onDragOver={(e) => {
                e.preventDefault()
                setOverStatus(status)
              }}
              onDragLeave={(e) => {
                if (e.currentTarget === e.target) setOverStatus(null)
              }}
              onDrop={() => onDrop(status)}
              className={cn(
                'bg-muted/40 flex w-72 shrink-0 flex-col rounded-lg border transition-colors',
                isOver && 'border-primary bg-primary/5'
              )}
            >
              <header className='flex items-center gap-2 border-b px-3 py-2.5'>
                <span
                  className='inline-block size-2.5 rounded-full'
                  style={{ backgroundColor: color }}
                />
                <h3 className='text-sm font-semibold'>{status}</h3>
                <span className='bg-background text-muted-foreground ms-1 rounded-full border px-1.5 text-xs leading-5'>
                  {items.length}
                </span>
                <span className='text-muted-foreground ms-auto text-xs'>
                  {formatAmount(total)}
                </span>
              </header>

              <div className='flex flex-1 flex-col gap-2 overflow-y-auto p-2'>
                {items.map((lead) => (
                  <article
                    key={lead.id}
                    draggable
                    onDragStart={() => setDraggingId(lead.id)}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setOverStatus(null)
                    }}
                    className={cn(
                      'bg-card text-card-foreground cursor-grab rounded-md border p-3 shadow-sm transition-opacity active:cursor-grabbing',
                      draggingId === lead.id && 'opacity-50'
                    )}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <span className='truncate text-sm font-medium'>
                        {lead.name || '—'}
                      </span>
                      <Badge variant='secondary' className='font-normal'>
                        {lead.platform}
                      </Badge>
                    </div>
                    <div className='text-muted-foreground mt-2 flex items-center gap-1.5 text-xs'>
                      <Building2 className='size-3.5' />
                      <span className='truncate'>{lead.company || '—'}</span>
                    </div>
                    <div className='mt-3 flex items-center justify-between gap-2'>
                      <span className='inline-flex items-center gap-1.5'>
                        <Avatar className='size-5'>
                          <AvatarFallback className='bg-primary/10 text-primary text-[10px]'>
                            {initials(lead.owner)}
                          </AvatarFallback>
                        </Avatar>
                        <span className='text-muted-foreground text-xs'>
                          {lead.owner || '—'}
                        </span>
                      </span>
                      <span className='text-sm font-semibold'>
                        {formatAmount(lead.amount)}
                      </span>
                    </div>
                    <div className='text-muted-foreground mt-2 flex items-center gap-1.5 text-xs'>
                      <CalendarIcon className='size-3.5' />
                      {lead.followUpDate || '—'}
                    </div>
                  </article>
                ))}
                {items.length === 0 && (
                  <div className='text-muted-foreground/60 flex h-20 items-center justify-center rounded-md border border-dashed text-xs'>
                    {isOver ? '释放以移动到此' : '暂无线索'}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
