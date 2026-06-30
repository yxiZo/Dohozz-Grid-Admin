import { useCallback, useMemo, useRef, useState } from 'react'
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  colorSchemeDark,
  type ColDef,
  type GetContextMenuItemsParams,
  type GridApi,
  type GridReadyEvent,
  type CellValueChangedEvent,
  type ValueFormatterParams,
  type MenuItemDef,
  type DefaultMenuItem,
} from 'ag-grid-community'
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise'
import { AgGridReact } from 'ag-grid-react'
import { Plus, Trash2, Download } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  type Lead,
  channelOptions,
  companyOptions,
  ownerOptions,
  platformOptions,
  statusOptions,
} from '../data/data'
import {
  BadgeRenderer,
  CompanyRenderer,
  ComboboxCellEditor,
  DateCellEditor,
  DateRenderer,
  PersonRenderer,
  StatusRenderer,
} from './cell-editors'

// Register all Community + Enterprise modules once.
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])

// Running without a license key: AG Grid Enterprise shows a watermark and a
// console message. This is expected for trial/evaluation usage.
LicenseManager.setLicenseKey('')

// Base theme; dark variant is composed on the fly with the dark color scheme.
const baseTheme = themeQuartz
const darkTheme = themeQuartz.withPart(colorSchemeDark)

let idCounter = 0
function newId() {
  idCounter += 1
  return `N-${Date.now().toString().slice(-6)}-${idCounter}`
}

const currencyFormatter = (params: ValueFormatterParams<Lead, number>) => {
  if (params.value == null || Number.isNaN(params.value)) return ''
  return `¥${Number(params.value).toLocaleString('zh-CN')}`
}

type LeadsGridProps = {
  initialData: Lead[]
}

export function LeadsGrid({ initialData }: LeadsGridProps) {
  const { resolvedTheme } = useTheme()
  const gridApiRef = useRef<GridApi<Lead> | null>(null)
  const [rows, setRows] = useState<Lead[]>(initialData)

  const onGridReady = useCallback((e: GridReadyEvent<Lead>) => {
    gridApiRef.current = e.api
  }, [])

  const columnDefs = useMemo<ColDef<Lead>[]>(
    () => [
      {
        field: 'id',
        headerName: '线索编号',
        width: 130,
        editable: false,
        pinned: 'left',
        cellClass: 'text-muted-foreground',
      },
      { field: 'name', headerName: '客户名称', minWidth: 120 },
      {
        field: 'company',
        headerName: '公司',
        minWidth: 170,
        cellRenderer: CompanyRenderer,
        cellEditor: ComboboxCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
        cellEditorParams: {
          options: companyOptions,
          variant: 'company',
          allowCustom: true,
          placeholder: '搜索或新增公司…',
        },
      },
      {
        field: 'platform',
        headerName: '平台',
        width: 120,
        cellRenderer: BadgeRenderer,
        cellEditor: ComboboxCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
        cellEditorParams: { options: platformOptions, variant: 'badge' },
      },
      {
        field: 'channel',
        headerName: '联系渠道',
        width: 130,
        cellRenderer: BadgeRenderer,
        cellEditor: ComboboxCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
        cellEditorParams: { options: channelOptions, variant: 'badge' },
      },
      {
        field: 'status',
        headerName: '状态',
        width: 130,
        cellRenderer: StatusRenderer,
        cellEditor: ComboboxCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
        cellEditorParams: { options: statusOptions, variant: 'status' },
      },
      {
        field: 'owner',
        headerName: '负责人',
        width: 140,
        cellRenderer: PersonRenderer,
        cellEditor: ComboboxCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
        cellEditorParams: {
          options: ownerOptions,
          variant: 'person',
          allowCustom: true,
          placeholder: '搜索或新增负责人…',
        },
      },
      {
        field: 'amount',
        headerName: '预计金额',
        width: 130,
        cellDataType: 'number',
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: { min: 0, precision: 0 },
        valueFormatter: currencyFormatter,
        type: 'rightAligned',
      },
      {
        field: 'followUpDate',
        headerName: '跟进日期',
        width: 150,
        cellRenderer: DateRenderer,
        cellEditor: DateCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
      },
      { field: 'note', headerName: '备注', minWidth: 220, flex: 1 },
    ],
    []
  )

  const defaultColDef = useMemo<ColDef<Lead>>(
    () => ({
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
    }),
    []
  )

  const getRowId = useCallback(
    (params: { data: Lead }) => params.data.id,
    []
  )

  // Editing immediately reflects into in-memory state.
  const onCellValueChanged = useCallback((e: CellValueChangedEvent<Lead>) => {
    const updated = e.data
    setRows((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...updated } : r))
    )
  }, [])

  const addRow = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10)
    const blank: Lead = {
      id: newId(),
      name: '',
      company: '',
      platform: platformOptions[0],
      channel: channelOptions[0],
      status: statusOptions[0],
      owner: '',
      amount: 0,
      followUpDate: today,
      note: '',
    }
    setRows((prev) => [blank, ...prev])
    // Focus the first editable cell of the new row after render.
    requestAnimationFrame(() => {
      const api = gridApiRef.current
      if (!api) return
      api.ensureIndexVisible(0, 'top')
      api.startEditingCell({ rowIndex: 0, colKey: 'name' })
    })
  }, [])

  // Collect row ids that intersect the current cell selection ranges.
  const getSelectedRowIds = useCallback((): string[] => {
    const api = gridApiRef.current
    if (!api) return []
    const ranges = api.getCellRanges() ?? []
    const ids = new Set<string>()
    for (const range of ranges) {
      if (!range.startRow || !range.endRow) continue
      const start = Math.min(range.startRow.rowIndex, range.endRow.rowIndex)
      const end = Math.max(range.startRow.rowIndex, range.endRow.rowIndex)
      for (let i = start; i <= end; i++) {
        const node = api.getDisplayedRowAtIndex(i)
        if (node?.data) ids.add(node.data.id)
      }
    }
    return [...ids]
  }, [])

  const deleteRowsByIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    const idSet = new Set(ids)
    setRows((prev) => prev.filter((r) => !idSet.has(r.id)))
  }, [])

  const deleteSelected = useCallback(() => {
    deleteRowsByIds(getSelectedRowIds())
  }, [deleteRowsByIds, getSelectedRowIds])

  const exportCsv = useCallback(() => {
    gridApiRef.current?.exportDataAsCsv({ fileName: 'leads.csv' })
  }, [])

  const getContextMenuItems = useCallback(
    (
      params: GetContextMenuItemsParams<Lead>
    ): (DefaultMenuItem | MenuItemDef)[] => {
      const clickedId = params.node?.data?.id
      const selectedIds = getSelectedRowIds()
      const idsToDelete =
        selectedIds.length > 0
          ? selectedIds
          : clickedId
            ? [clickedId]
            : []
      return [
        {
          name: '在上方插入新行',
          icon: '<span class="ag-icon ag-icon-plus"></span>',
          action: () => addRow(),
        },
        {
          name:
            idsToDelete.length > 1
              ? `删除选中的 ${idsToDelete.length} 行`
              : '删除此行',
          action: () => deleteRowsByIds(idsToDelete),
        },
        'separator',
        'copy',
        'copyWithHeaders',
        'paste',
        'separator',
        'export',
      ]
    },
    [addRow, deleteRowsByIds, getSelectedRowIds]
  )

  return (
    <div className='flex flex-1 flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button size='sm' onClick={addRow}>
          <Plus className='size-4' />
          新增行
        </Button>
        <Button size='sm' variant='outline' onClick={deleteSelected}>
          <Trash2 className='size-4' />
          删除选中行
        </Button>
        <Button size='sm' variant='outline' onClick={exportCsv}>
          <Download className='size-4' />
          导出 CSV
        </Button>
        <p className='text-muted-foreground ms-auto text-sm'>
          双击编辑 · 方向键/Tab 移动 · 拖拽框选 · Ctrl+C / Ctrl+V 复制粘贴（支持 Excel）
        </p>
      </div>

      <div className='min-h-0 flex-1'>
        <AgGridReact<Lead>
          theme={resolvedTheme === 'dark' ? darkTheme : baseTheme}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          cellSelection={{ handle: { mode: 'range' } }}
          getContextMenuItems={getContextMenuItems}
          stopEditingWhenCellsLoseFocus
          animateRows
          rowHeight={44}
          headerHeight={44}
        />
      </div>
    </div>
  )
}
