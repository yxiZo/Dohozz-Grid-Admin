import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type CustomCellEditorProps } from 'ag-grid-react'
import { type ICellRendererParams } from 'ag-grid-community'
import { format, parse, isValid } from 'date-fns'
import { Check, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  type Creator,
  dedupColorMap,
  reviewColorMap,
  workingStatusColorMap,
} from '../data/data'

const DATE_FMT = 'yyyy-MM-dd'

export type ComboOptionVariant =
  | 'plain'
  | 'badge'
  | 'review'
  | 'dedup'
  | 'working'

export type ComboEditorParams = {
  options: readonly string[]
  variant?: ComboOptionVariant
  allowCustom?: boolean
  placeholder?: string
}

const colorMapFor: Record<string, Record<string, string>> = {
  review: reviewColorMap,
  dedup: dedupColorMap,
  working: workingStatusColorMap,
}

export function OptionLabel({
  value,
  variant,
}: {
  value: string
  variant: ComboOptionVariant
}) {
  if (!value) return null
  if (variant === 'review' || variant === 'dedup' || variant === 'working') {
    const color = colorMapFor[variant][value] ?? 'var(--muted-foreground)'
    return (
      <span className='inline-flex items-center gap-2'>
        <span
          className='inline-block size-2 rounded-full'
          style={{ backgroundColor: color }}
        />
        {value}
      </span>
    )
  }
  if (variant === 'badge') {
    return (
      <Badge variant='secondary' className='font-normal'>
        {value}
      </Badge>
    )
  }
  return <span>{value}</span>
}

export function ComboboxCellEditor(
  props: CustomCellEditorProps<Creator, string> & ComboEditorParams
) {
  const {
    value,
    onValueChange,
    stopEditing,
    options,
    variant = 'plain',
    allowCustom = false,
    placeholder = '搜索…',
  } = props
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [])

  const select = useCallback(
    (next: string) => {
      onValueChange(next)
      stopEditing()
    },
    [onValueChange, stopEditing]
  )

  const showCreate =
    allowCustom &&
    search.trim().length > 0 &&
    !options.some((o) => o === search.trim())

  return (
    <div className='bg-popover text-popover-foreground w-56 overflow-hidden rounded-md border shadow-md'>
      <Command shouldFilter>
        <CommandInput
          ref={inputRef}
          value={search}
          onValueChange={setSearch}
          placeholder={placeholder}
          className='h-9'
        />
        <CommandList>
          <CommandEmpty>
            {allowCustom ? '回车以使用输入的值' : '无匹配项'}
          </CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem key={opt} value={opt} onSelect={() => select(opt)}>
                <OptionLabel value={opt} variant={variant} />
                <Check
                  className={cn(
                    'ms-auto size-4',
                    opt === value ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
            {showCreate && (
              <CommandItem
                value={search.trim()}
                onSelect={() => select(search.trim())}
              >
                <span className='text-muted-foreground'>新增：</span>
                <OptionLabel value={search.trim()} variant={variant} />
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

export function DateCellEditor(props: CustomCellEditorProps<Creator, string>) {
  const { value, onValueChange, stopEditing } = props

  const selected = useMemo(() => {
    if (!value) return undefined
    const d = parse(value, DATE_FMT, new Date())
    return isValid(d) ? d : undefined
  }, [value])

  const onSelect = useCallback(
    (date: Date | undefined) => {
      onValueChange(date ? format(date, DATE_FMT) : null)
      stopEditing()
    },
    [onValueChange, stopEditing]
  )

  return (
    <div className='bg-popover text-popover-foreground overflow-hidden rounded-md border shadow-md'>
      <Calendar
        mode='single'
        selected={selected}
        defaultMonth={selected}
        captionLayout='dropdown'
        autoFocus
        onSelect={onSelect}
      />
    </div>
  )
}

export function ReviewRenderer(params: ICellRendererParams<Creator>) {
  return <OptionLabel value={params.value as string} variant='review' />
}

export function DedupRenderer(params: ICellRendererParams<Creator>) {
  return <OptionLabel value={params.value as string} variant='dedup' />
}

export function WorkingStatusRenderer(params: ICellRendererParams<Creator>) {
  return <OptionLabel value={params.value as string} variant='working' />
}

export function BadgeRenderer(params: ICellRendererParams<Creator>) {
  return <OptionLabel value={params.value as string} variant='badge' />
}

export function DateRenderer(params: ICellRendererParams<Creator>) {
  const value = params.value as string
  if (!value) return null
  const d = parse(value, DATE_FMT, new Date())
  return (
    <span className='inline-flex items-center gap-2'>
      <CalendarIcon className='text-muted-foreground size-3.5' />
      {isValid(d) ? format(d, 'yyyy/MM/dd') : value}
    </span>
  )
}
