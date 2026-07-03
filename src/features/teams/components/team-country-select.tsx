import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Team } from '../data/schema'

// country_id = null 的哨兵值，用于「全部国家」选项。
export const ALL_COUNTRIES = 'all' as const

type TeamSelectProps = {
  teams: Team[]
  value: number | null
  onChange: (teamId: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TeamSelect({
  teams,
  value,
  onChange,
  placeholder = '选择团队',
  disabled,
  className,
}: TeamSelectProps) {
  return (
    <Select
      value={value != null ? String(value) : undefined}
      onValueChange={(v) => onChange(Number(v))}
      disabled={disabled}
    >
      <SelectTrigger className={className ?? 'w-full'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => (
          <SelectItem key={team.id} value={String(team.id)}>
            {team.team_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type CountrySelectProps = {
  /** 当前选中的团队，国家选项来自该团队覆盖的国家 */
  team: Team | null
  /** null 表示「全部国家」，仅在 allowAll 时可选 */
  value: number | null
  onChange: (countryId: number | null) => void
  /** 是否提供「全部国家」选项（配置员工范围时为 true，业务数据为 false） */
  allowAll?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CountrySelect({
  team,
  value,
  onChange,
  allowAll = false,
  placeholder = '选择国家',
  disabled,
  className,
}: CountrySelectProps) {
  const selectValue =
    value === null ? (allowAll ? ALL_COUNTRIES : undefined) : String(value)

  return (
    <Select
      value={selectValue}
      onValueChange={(v) =>
        onChange(v === ALL_COUNTRIES ? null : Number(v))
      }
      disabled={disabled || !team}
    >
      <SelectTrigger className={className ?? 'w-full'}>
        <SelectValue placeholder={team ? placeholder : '请先选择团队'} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && (
          <SelectItem value={ALL_COUNTRIES}>全部国家</SelectItem>
        )}
        {team?.countries.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.country_name}（{c.country_code}）
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
