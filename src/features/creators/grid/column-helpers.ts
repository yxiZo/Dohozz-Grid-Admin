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
