import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type CustomCellEditorProps, useGridCellEditor } from 'ag-grid-react'
import { type ICellRendererParams } from 'ag-grid-community'
import { format, parse, isValid } from 'date-fns'
import { Check, CalendarIcon, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { type Lead, statusColorMap } from '../data/data'

const DATE_FMT = 'yyyy-MM-dd'

export type ComboOptionVariant = 'plain' | 'badge' | 'person' | 'company' | 'status'

export type ComboEditorParams = {
  /** Selectable option values. */
  options: readonly string[]
  /** Visual style of each option / selected display. */
  variant?: ComboOptionVariant
  /** Allow typing a value that is not in the list. */
  allowCustom?: boolean
  /** Placeholder text for the search input. */
  placeholder?: string
}

/** Build initials for the avatar fallback from a Chinese or latin name. */
function initials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  // For CJK names keep the last 2 chars, for latin take first letters.
  if (/[\u4e00-\u9fa5]/.test(trimmed)) return trimmed.slice(-2)
  return trimmed
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function OptionLabel({
  value,
  variant,
}: {
  value: string
  variant: ComboOptionVariant
}) {
  if (!value) return null
  if (variant === 'status') {
    const color = statusColorMap[value] ?? 'var(--muted-foreground)'
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
  if (variant === 'person') {
    return (
      <span className='inline-flex items-center gap-2'>
        <Avatar className='size-5'>
          <AvatarFallback className='bg-primary/10 text-primary text-[10px]'>
            {initials(value)}
          </AvatarFallback>
        </Avatar>
        {value}
      </span>
    )
  }
  if (variant === 'company') {
    return (
      <span className='inline-flex items-center gap-2'>
        <Building2 className='text-muted-foreground size-4' />
        {value}
      </span>
    )
  }
  return <span>{value}</span>
}

/* -------------------------------------------------------------------------- */
/*  Combobox editor (platform / channel / status / owner / company)           */
/* -------------------------------------------------------------------------- */

export function ComboboxCellEditor(
  props: CustomCellEditorProps<Lead, string> & ComboEditorParams
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

  useGridCellEditor({ isPopup: () => true })

  useEffect(() => {
    // Focus the search box once mounted so typing works immediately.
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

/* -------------------------------------------------------------------------- */
/*  Date editor                                                               */
/* -------------------------------------------------------------------------- */

export function DateCellEditor(props: CustomCellEditorProps<Lead, string>) {
  const { value, onValueChange, stopEditing } = props

  useGridCellEditor({ isPopup: () => true })

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

/* -------------------------------------------------------------------------- */
/*  Renderers (pretty display in non-editing state)                           */
/* -------------------------------------------------------------------------- */

export function StatusRenderer(params: ICellRendererParams<Lead>) {
  const value = params.value as string
  return <OptionLabel value={value} variant='status' />
}

export function BadgeRenderer(params: ICellRendererParams<Lead>) {
  const value = params.value as string
  return <OptionLabel value={value} variant='badge' />
}

export function PersonRenderer(params: ICellRendererParams<Lead>) {
  const value = params.value as string
  return <OptionLabel value={value} variant='person' />
}

export function CompanyRenderer(params: ICellRendererParams<Lead>) {
  const value = params.value as string
  return <OptionLabel value={value} variant='company' />
}

export function DateRenderer(params: ICellRendererParams<Lead>) {
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
