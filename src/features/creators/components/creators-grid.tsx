import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  AllCommunityModule,
  ModuleRegistry,
  colorSchemeDark,
  themeQuartz,
  type CellValueChangedEvent,
  type ColDef,
  type DefaultMenuItem,
  type GetContextMenuItemsParams,
  type GridApi,
  type GridReadyEvent,
  type MenuItemDef,
} from 'ag-grid-community'
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise'
import { AgGridReact } from 'ag-grid-react'
import { useTheme } from '@/context/theme-provider'
import {
  type Creator,
  type CreatorStage,
  createBlankCreator,
} from '../data/data'
import { columnsByStage } from '../grid/columns'
import { type CreatorGridContext } from './creator-cell'
import { CreatorEditDialog } from './creator-edit-dialog'
import { CreatorGridToolbar } from './creator-grid-toolbar'

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])
LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY ?? '')

const baseTheme = themeQuartz
const darkTheme = themeQuartz.withPart(colorSchemeDark)

type CreatorsGridProps = {
  stage: CreatorStage
  rows: Creator[]
  setRows: Dispatch<SetStateAction<Creator[]>>
}

export function CreatorsGrid({ stage, rows, setRows }: CreatorsGridProps) {
  const { resolvedTheme } = useTheme()
  const gridApiRef = useRef<GridApi<Creator> | null>(null)
  const [editing, setEditing] = useState<Creator | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const onGridReady = useCallback((e: GridReadyEvent<Creator>) => {
    gridApiRef.current = e.api
  }, [])

  const onEditCreator = useCallback((creator: Creator) => {
    setEditing({ ...creator })
    setDialogOpen(true)
  }, [])

  const addRow = useCallback(() => {
    onEditCreator(createBlankCreator(stage))
  }, [onEditCreator, stage])

  const gridContext = useMemo<CreatorGridContext>(
    () => ({ onEditCreator }),
    [onEditCreator]
  )

  const saveCreator = useCallback(
    (updated: Creator) => {
      setRows((prev) => {
        const exists = prev.some((row) => row.id === updated.id)
        if (!exists) return [{ ...updated }, ...prev]
        return prev.map((row) => (row.id === updated.id ? { ...updated } : row))
      })
    },
    [setRows]
  )

  const columnDefs = useMemo<ColDef<Creator>[]>(
    () => columnsByStage[stage],
    [stage]
  )

  const defaultColDef = useMemo<ColDef<Creator>>(
    () => ({
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
    }),
    []
  )

  const autoGroupColumnDef = useMemo<ColDef<Creator>>(
    () => ({
      headerName: '分组',
      minWidth: 220,
      cellRendererParams: { suppressCount: false },
    }),
    []
  )

  const sideBar = useMemo(
    () => ({ toolPanels: ['columns', 'filters'], defaultToolPanel: '' }),
    []
  )

  const statusBar = useMemo(
    () => ({
      statusPanels: [
        { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
        { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
        {
          statusPanel: 'agAggregationComponent',
          align: 'right',
          statusPanelParams: {
            aggFuncs: ['count', 'sum', 'avg', 'min', 'max'],
          },
        },
      ],
    }),
    []
  )

  const getRowId = useCallback(
    (params: { data: Creator }) => params.data.id,
    []
  )

  const onCellValueChanged = useCallback(
    (e: CellValueChangedEvent<Creator>) => {
      const updated = e.data
      setRows((prev) =>
        prev.map((row) => (row.id === updated.id ? { ...updated } : row))
      )
    },
    [setRows]
  )

  const getRangeRowIds = useCallback((): string[] => {
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

  const getSelectedRowIds = useCallback((): string[] => {
    const api = gridApiRef.current
    if (!api) return []

    const selectedIds = api.getSelectedRows().map((row) => row.id)
    if (selectedIds.length > 0) return selectedIds

    return getRangeRowIds()
  }, [getRangeRowIds])

  const deleteRowsByIds = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      const idSet = new Set(ids)
      setRows((prev) => prev.filter((row) => !idSet.has(row.id)))
      gridApiRef.current?.deselectAll()
    },
    [setRows]
  )

  const deleteSelected = useCallback(() => {
    deleteRowsByIds(getSelectedRowIds())
  }, [deleteRowsByIds, getSelectedRowIds])

  const exportCsv = useCallback(() => {
    gridApiRef.current?.exportDataAsCsv({ fileName: `creators-${stage}.csv` })
  }, [stage])

  const getContextMenuItems = useCallback(
    (
      params: GetContextMenuItemsParams<Creator>
    ): (DefaultMenuItem | MenuItemDef)[] => {
      const clickedId = params.node?.data?.id
      const selectedIds = getSelectedRowIds()
      const idsToDelete =
        selectedIds.length > 0 ? selectedIds : clickedId ? [clickedId] : []

      return [
        {
          name: '编辑达人信息',
          disabled: !params.node?.data,
          action: () => {
            if (params.node?.data) onEditCreator(params.node.data)
          },
        },
        {
          name: '新增达人',
          icon: '<span class="ag-icon ag-icon-plus"></span>',
          action: addRow,
        },
        {
          name:
            idsToDelete.length > 1
              ? `删除选中的 ${idsToDelete.length} 行`
              : '删除此行',
          disabled: idsToDelete.length === 0,
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
    [addRow, deleteRowsByIds, getSelectedRowIds, onEditCreator]
  )

  return (
    <div className='flex flex-1 flex-col gap-3'>
      <CreatorGridToolbar
        rowCount={rows.length}
        onAdd={addRow}
        onDeleteSelected={deleteSelected}
        onExport={exportCsv}
      />

      <div className='min-h-0 flex-1'>
        <AgGridReact<Creator>
          theme={resolvedTheme === 'dark' ? darkTheme : baseTheme}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          context={gridContext}
          getRowId={getRowId}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          cellSelection={{ handle: { mode: 'range' } }}
          getContextMenuItems={getContextMenuItems}
          sideBar={sideBar}
          statusBar={statusBar}
          rowSelection={{
            mode: 'multiRow',
            enableClickSelection: true,
            enableSelectionWithoutKeys: true,
          }}
          rowGroupPanelShow='always'
          enableCharts
          groupDefaultExpanded={1}
          stopEditingWhenCellsLoseFocus
          animateRows
          rowHeight={48}
          headerHeight={44}
        />
      </div>

      <CreatorEditDialog
        key={`${editing?.id ?? 'empty'}-${dialogOpen ? 'open' : 'closed'}`}
        stage={stage}
        creator={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={saveCreator}
      />
    </div>
  )
}
