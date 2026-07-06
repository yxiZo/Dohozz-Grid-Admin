import { Filter, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Creator, type CreatorStage } from '../data/data'
import {
  ALL_VALUE,
  filterConfigByStage,
  type FilterState,
  type StageFilterConfig,
} from '../grid/view-config'

type CreatorFilterBarProps = {
  stage: CreatorStage
  value: FilterState
  onChange: (next: FilterState) => void
}

export function CreatorFilterBar({
  stage,
  value,
  onChange,
}: CreatorFilterBarProps) {
  const config: StageFilterConfig = filterConfigByStage[stage]

  const activeCount =
    (value.search.trim() ? 1 : 0) +
    Object.values(value.selects).filter((v) => v && v !== ALL_VALUE).length

  const setSearch = (search: string) => onChange({ ...value, search })

  const setSelect = (field: keyof Creator, next: string) => {
    const selects = { ...value.selects }
    if (!next || next === ALL_VALUE) delete selects[field]
    else selects[field] = next
    onChange({ ...value, selects })
  }

  const reset = () => onChange({ search: '', selects: {} })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size='sm'
          variant={activeCount > 0 ? 'secondary' : 'outline'}
          className='relative'
        >
          <Filter data-icon='inline-start' />
          筛选
          {activeCount > 0 && (
            <Badge
              variant='default'
              className='ms-1 h-5 min-w-5 rounded-full px-1 tabular-nums'
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-80 space-y-4'>
        <div className='flex items-center justify-between'>
          <p className='text-sm font-medium'>筛选条件</p>
          {activeCount > 0 && (
            <Button
              size='sm'
              variant='ghost'
              onClick={reset}
              className='text-muted-foreground -me-2 h-7'
            >
              <X data-icon='inline-start' />
              清除
            </Button>
          )}
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label className='text-xs text-muted-foreground'>关键词</Label>
          <div className='relative'>
            <Search className='text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2' />
            <Input
              value={value.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={config.searchPlaceholder}
              className='ps-8'
              aria-label='搜索达人'
            />
          </div>
        </div>

        {config.selects.map((def) => {
          const current = value.selects[def.field] ?? ALL_VALUE
          return (
            <div key={String(def.field)} className='flex flex-col gap-1.5'>
              <Label className='text-xs text-muted-foreground'>
                {def.label}
              </Label>
              <Select
                value={current}
                onValueChange={(v) => setSelect(def.field, v)}
              >
                <SelectTrigger size='sm' className='w-full'>
                  <SelectValue placeholder={def.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>{`全部${def.label}`}</SelectItem>
                  {def.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
