import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <div className='flex flex-wrap items-center gap-2'>
      <div className='relative w-full sm:w-64'>
        <Search className='text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2' />
        <Input
          value={value.search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={config.searchPlaceholder}
          className='ps-8'
          aria-label='搜索达人'
        />
      </div>

      {config.selects.map((def) => {
        const current = value.selects[def.field] ?? ALL_VALUE
        return (
          <Select
            key={String(def.field)}
            value={current}
            onValueChange={(v) => setSelect(def.field, v)}
          >
            <SelectTrigger size='sm' className='w-auto min-w-32'>
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
        )
      })}

      {activeCount > 0 && (
        <Button
          size='sm'
          variant='ghost'
          onClick={reset}
          className='text-muted-foreground'
        >
          <X data-icon='inline-start' />
          {`清除筛选 (${activeCount})`}
        </Button>
      )}
    </div>
  )
}
