import { useMemo, useState } from 'react'
import { GripVertical, Pencil, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { type Creator, type CreatorStage } from '../data/data'
import { kanbanConfigByStage, type KanbanColumnDef } from '../grid/view-config'

type CreatorKanbanProps = {
  stage: CreatorStage
  rows: Creator[]
  onEditCreator: (creator: Creator) => void
  onStatusChange: (id: string, value: string) => void
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

function KanbanCard({
  creator,
  onEditCreator,
  onDragStart,
  dragging,
}: {
  creator: Creator
  onEditCreator: (creator: Creator) => void
  onDragStart: (e: React.DragEvent) => void
  dragging: boolean
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'group bg-card rounded-lg border p-3 shadow-xs transition-shadow hover:shadow-md',
        dragging && 'opacity-40'
      )}
    >
      <div className='flex items-center gap-2'>
        <GripVertical className='text-muted-foreground size-4 shrink-0 cursor-grab active:cursor-grabbing' />
        <Avatar className='size-7'>
          <AvatarFallback className='bg-primary/10 text-primary text-[11px] font-medium'>
            {initials(creator.tiktokId)}
          </AvatarFallback>
        </Avatar>
        <span className='truncate text-sm font-medium'>{creator.tiktokId}</span>
        <button
          type='button'
          onClick={() => onEditCreator(creator)}
          className='text-muted-foreground hover:text-foreground ms-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
          aria-label='编辑达人'
        >
          <Pencil className='size-3.5' />
        </button>
      </div>

      <div className='mt-2 flex flex-wrap items-center gap-1.5'>
        {creator.contentCategory && (
          <Badge variant='secondary' className='font-normal'>
            {creator.contentCategory}
          </Badge>
        )}
        {creator.bd && (
          <Badge variant='outline' className='font-normal'>
            {creator.bd}
          </Badge>
        )}
      </div>

      <div className='text-muted-foreground mt-2 flex items-center justify-between text-xs'>
        <span className='flex items-center gap-1'>
          <Users className='size-3.5' />
          {formatFollower(creator.follower)}
        </span>
        <span className='flex items-center gap-1'>
          <TrendingUp className='size-3.5' />
          {'$' + creator.gmv.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  )
}

export function CreatorKanban({
  stage,
  rows,
  onEditCreator,
  onStatusChange,
}: CreatorKanbanProps) {
  const config = kanbanConfigByStage[stage]
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, Creator[]>()
    for (const col of config.columns) map.set(col.value, [])
    const other: Creator[] = []
    for (const row of rows) {
      const key = String(row[config.field] ?? '')
      if (map.has(key)) map.get(key)!.push(row)
      else other.push(row)
    }
    return { map, other }
  }, [rows, config])

  const handleDrop = (e: React.DragEvent, colValue: string) => {
    // Read the dragged id from the payload rather than React state so the drop
    // does not depend on a state update from dragstart having committed yet.
    const id = e.dataTransfer.getData('text/plain') || draggingId
    if (id) {
      const current = rows.find((r) => r.id === id)
      if (current && String(current[config.field] ?? '') !== colValue) {
        onStatusChange(id, colValue)
      }
    }
    setDraggingId(null)
    setOverCol(null)
  }

  return (
    <div className='flex flex-1 gap-3 overflow-x-auto pb-2'>
      {config.columns.map((col: KanbanColumnDef) => {
        const items = grouped.map.get(col.value) ?? []
        const isOver = overCol === col.value
        return (
          <div
            key={col.value}
            onDragOver={(e) => {
              e.preventDefault()
              setOverCol(col.value)
            }}
            onDragLeave={(e) => {
              if (e.currentTarget === e.target) setOverCol(null)
            }}
            onDrop={(e) => handleDrop(e, col.value)}
            className={cn(
              'bg-muted/40 flex w-72 shrink-0 flex-col rounded-xl border transition-colors',
              isOver && 'border-primary bg-primary/5'
            )}
          >
            <div className='flex items-center gap-2 px-3 py-2.5'>
              <span
                className='inline-block size-2.5 rounded-full'
                style={{ backgroundColor: col.color }}
              />
              <span className='text-sm font-semibold'>{col.value}</span>
              <Badge variant='secondary' className='ms-auto font-normal'>
                {items.length}
              </Badge>
            </div>

            <div className='flex min-h-24 flex-col gap-2 overflow-y-auto px-2 pb-3'>
              {items.map((creator) => (
                <KanbanCard
                  key={creator.id}
                  creator={creator}
                  dragging={draggingId === creator.id}
                  onEditCreator={onEditCreator}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', creator.id)
                    setDraggingId(creator.id)
                  }}
                />
              ))}
              {items.length === 0 && (
                <p className='text-muted-foreground px-2 py-6 text-center text-xs'>
                  拖拽达人到此列
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
