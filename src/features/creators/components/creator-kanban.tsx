import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GripVertical, Loader2, Pencil, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { type Creator, type CreatorStage } from '../data/data'
import {
  type AnyFilter,
  PAGE_SIZE,
  fetchCreators,
} from '../data/mock-server'
import { kanbanConfigByStage, type KanbanColumnDef } from '../grid/view-config'

type CreatorKanbanProps = {
  stage: CreatorStage
  search: string
  filterModel: Record<string, AnyFilter>
  /** Bumped by the parent after any mutation to force all columns to reload. */
  refreshKey: number
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

type KanbanColumnProps = {
  stage: CreatorStage
  field: keyof Creator
  col: KanbanColumnDef
  search: string
  filterModel: Record<string, AnyFilter>
  draggingId: string | null
  isOver: boolean
  onEditCreator: (creator: Creator) => void
  onCardDragStart: (creator: Creator) => void
  onColDragOver: () => void
  onColDragLeave: (e: React.DragEvent) => void
  onColDrop: (colValue: string) => void
}

/**
 * A single Kanban column. Owns its own Infinite-scroll paging: it asks the mock
 * backend for one PAGE_SIZE block at a time (filtered to this column's status),
 * appending more as the user scrolls near the bottom.
 */
function KanbanColumn({
  stage,
  field,
  col,
  search,
  filterModel,
  draggingId,
  isOver,
  onEditCreator,
  onCardDragStart,
  onColDragOver,
  onColDragLeave,
  onColDrop,
}: KanbanColumnProps) {
  const [rows, setRows] = useState<Creator[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const loadingRef = useRef(false)
  const lenRef = useRef(0)
  const totalRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // This column's server filter = the shared filters plus a "set" filter that
  // pins the status field to this column's value.
  const columnFilter = useMemo<Record<string, AnyFilter>>(
    () => ({ ...filterModel, [field]: { filterType: 'set', values: [col.value] } }),
    [filterModel, field, col.value]
  )

  const loadMore = useCallback(() => {
    if (loadingRef.current) return
    if (totalRef.current !== null && lenRef.current >= totalRef.current) return
    loadingRef.current = true
    setLoading(true)
    const start = lenRef.current
    fetchCreators({
      stage,
      startRow: start,
      endRow: start + PAGE_SIZE,
      filterModel: columnFilter,
      search,
    })
      .then(({ rows: newRows, rowCount }) => {
        setRows((prev) => {
          const next = [...prev, ...newRows]
          lenRef.current = next.length
          return next
        })
        totalRef.current = rowCount
        setTotal(rowCount)
      })
      .finally(() => {
        loadingRef.current = false
        setLoading(false)
      })
  }, [stage, columnFilter, search])

  // Load the first block on mount. The parent remounts this column (via a
  // composite key) whenever the stage, filters, search, or refresh key change,
  // so mounting is exactly when a fresh reload should happen.
  useEffect(() => {
    loadMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-fill: if the loaded rows don't overflow the column yet and there are
  // more to fetch, keep loading so the scrollbar can appear.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || loading) return
    const hasMore = total === null || rows.length < total
    if (hasMore && rows.length > 0 && el.scrollHeight <= el.clientHeight) {
      loadMore()
    }
  }, [rows.length, total, loading, loadMore])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) loadMore()
  }

  const remaining =
    total !== null && total > rows.length ? total - rows.length : 0

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        onColDragOver()
      }}
      onDragLeave={onColDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        onColDrop(col.value)
      }}
      className={cn(
        'bg-muted/40 flex min-h-0 w-72 shrink-0 flex-col rounded-xl border transition-colors',
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
          {total ?? '…'}
        </Badge>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3'
      >
        {rows.map((creator) => (
          <KanbanCard
            key={creator.id}
            creator={creator}
            dragging={draggingId === creator.id}
            onEditCreator={onEditCreator}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', creator.id)
              onCardDragStart(creator)
            }}
          />
        ))}

        {loading && (
          <div className='text-muted-foreground flex items-center justify-center gap-2 py-3 text-xs'>
            <Loader2 className='size-3.5 animate-spin' />
            加载中…
          </div>
        )}

        {!loading && rows.length === 0 && (
          <p className='text-muted-foreground px-2 py-6 text-center text-xs'>
            拖拽达人到此列
          </p>
        )}

        {!loading && remaining > 0 && (
          <p className='text-muted-foreground py-1 text-center text-[11px]'>
            {`下滑加载更多 (剩余 ${remaining})`}
          </p>
        )}
      </div>
    </div>
  )
}

export function CreatorKanban({
  stage,
  search,
  filterModel,
  refreshKey,
  onEditCreator,
  onStatusChange,
}: CreatorKanbanProps) {
  const config = kanbanConfigByStage[stage]
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null>(null)
  const draggingRef = useRef<Creator | null>(null)

  // Changing this string remounts every column, which triggers a fresh reload
  // from the mock backend (see the column's mount effect).
  const resetToken = `${search}|${JSON.stringify(filterModel)}|${refreshKey}`

  const handleDrop = (colValue: string) => {
    const c = draggingRef.current
    if (c && String(c[config.field] ?? '') !== colValue) {
      onStatusChange(c.id, colValue)
    }
    draggingRef.current = null
    setDraggingId(null)
    setOverCol(null)
  }

  return (
    <div className='flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2'>
      {config.columns.map((col) => (
        <KanbanColumn
          key={`${col.value}|${resetToken}`}
          stage={stage}
          field={config.field}
          col={col}
          search={search}
          filterModel={filterModel}
          draggingId={draggingId}
          isOver={overCol === col.value}
          onEditCreator={onEditCreator}
          onCardDragStart={(creator) => {
            draggingRef.current = creator
            setDraggingId(creator.id)
          }}
          onColDragOver={() => setOverCol(col.value)}
          onColDragLeave={(e) => {
            if (e.currentTarget === e.target) setOverCol(null)
          }}
          onColDrop={handleDrop}
        />
      ))}
    </div>
  )
}
