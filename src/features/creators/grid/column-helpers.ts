import { format } from 'date-fns'
import { type ColDef, type ValueFormatterParams } from 'ag-grid-community'
import {
  type ComboOptionVariant,
  BadgeRenderer,
  ComboboxCellEditor,
  DateCellEditor,
  DateRenderer,
} from '../components/cell-editors'
import { CreatorCellRenderer } from '../components/creator-cell'
import { type Creator } from '../data/data'

export const baseCreatorColumn: ColDef<Creator> = {
  headerName: 'Tiktok ID',
  colId: 'creator',
  field: 'tiktokId',
  width: 180,
  pinned: 'left',
  editable: false,
  filter: true,
  cellRenderer: CreatorCellRenderer,
}

// 团队 / 国家的展示映射（与 teams mock 数据保持一致）。
const TEAM_NAME_BY_ID: Record<number, string> = {
  1: 'Team A',
  2: 'Team B',
  3: '外部中台团队',
}

const COUNTRY_NAME_BY_ID: Record<number, string> = {
  1: '马来西亚',
  2: '印度尼西亚',
  3: '泰国',
  4: '新加坡',
  5: '越南',
  6: '菲律宾',
  7: '美国',
}

export const teamColumn: ColDef<Creator> = {
  field: 'teamId',
  headerName: '所属团队',
  width: 140,
  enableRowGroup: true,
  editable: false,
  valueFormatter: (params: ValueFormatterParams<Creator, number>) =>
    params.value == null ? '—' : (TEAM_NAME_BY_ID[params.value] ?? '—'),
}

export const countryColumn: ColDef<Creator> = {
  field: 'countryId',
  headerName: '所属国家',
  width: 130,
  enableRowGroup: true,
  editable: false,
  valueFormatter: (params: ValueFormatterParams<Creator, number>) =>
    params.value == null ? '—' : (COUNTRY_NAME_BY_ID[params.value] ?? '—'),
}

export const usdFormatter = (params: ValueFormatterParams<Creator, number>) => {
  if (params.value == null || Number.isNaN(params.value)) return ''
  return `$${Number(params.value).toLocaleString('en-US')}`
}

export const numberFormatter = (
  params: ValueFormatterParams<Creator, number>
) => {
  if (params.value == null || Number.isNaN(params.value)) return ''
  return Number(params.value).toLocaleString('en-US')
}

export const percentFormatter = (
  params: ValueFormatterParams<Creator, number>
) => {
  if (params.value == null || Number.isNaN(params.value)) return ''
  return `${Math.round(Number(params.value) * 100)}%`
}

export const comboColumn = (
  options: readonly string[],
  variant: ComboOptionVariant = 'plain',
  allowCustom = false
): Partial<ColDef<Creator>> => ({
  cellEditor: ComboboxCellEditor,
  cellEditorPopup: true,
  cellEditorPopupPosition: 'under',
  cellEditorParams: { options, variant, allowCustom },
})

export const dateColumn = (): Partial<ColDef<Creator>> => ({
  cellRenderer: DateRenderer,
  cellEditor: DateCellEditor,
  cellEditorPopup: true,
  cellEditorPopupPosition: 'under',
})

export const badgeComboColumn = (
  options: readonly string[],
  allowCustom = false
): Partial<ColDef<Creator>> => ({
  cellRenderer: BadgeRenderer,
  ...comboColumn(options, 'badge', allowCustom),
})

export const numberColumn = (): Partial<ColDef<Creator>> => ({
  type: 'rightAligned',
  cellEditor: 'agNumberCellEditor',
  valueFormatter: numberFormatter,
})

export const moneyColumn = (): Partial<ColDef<Creator>> => ({
  type: 'rightAligned',
  cellEditor: 'agNumberCellEditor',
  valueFormatter: usdFormatter,
  enableValue: true,
  aggFunc: 'sum',
})

export const localDateValue = () => format(new Date(), 'yyyy-MM-dd')
