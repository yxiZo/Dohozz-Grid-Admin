import { useCallback, useMemo, useRef, useState } from 'react'
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
  type IDatasource,
  type IGetRowsParams,
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
import {
  PAGE_SIZE,
  deleteCreators,
  fetchCreators,
  getRowCount,
  upsertCreator,
} from '../data/mock-server'
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
}

export function CreatorsGrid({ stage }: CreatorsGridProps) {
  const { resolvedTheme } = useTheme()
  const gridApiRef = useRef<GridApi<Creator> | null>(null)
  const [editing, setEditing] = useState<Creator | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [rowCount, setRowCount] = useState(() => getRowCount(stage))

  // Infinite Row Model datasource: the grid calls getRows for each block and we
  // resolve it from the mock backend (server-side sort/filter/pagination).
  const datasource = useMemo<IDatasource>(
    () => ({
      getRows: (params: IGetRowsParams) => {
        fetchCreators({
          stage,
          startRow: params.startRow,
          endRow: params.endRow,
          sortModel: params.sortModel,
          filterModel: params.filterModel,
        })
          .then(({ rows, rowCount: total }) => {
            // lastRow lets the grid know the total size so it can stop paging.
            const lastRow = params.endRow >= total ? total : undefined
            params.successCallback(rows, lastRow)
            setRowCount(total)
          })
          .catch(() => params.failCallback())
      },
    }),
    [stage]
  )

  const refreshGrid = useCallback(() => {
    gridApiRef.current?.refreshInfiniteCache()
    setRowCount(getRowCount(stage))
  }, [stage])

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
      upsertCreator(stage, updated)
      refreshGrid()
    },
    [refreshGrid, stage]
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

  const statusBar = useMemo(
    () => ({
      statusPanels: [
        { statusPanel: 'agTotalRowCountComponent', align: 'left' },
        { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
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
      // Persist inline edits back to the mock backend.
      if (e.data) upsertCreator(stage, e.data)
    },
    [stage]
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
      deleteCreators(stage, ids)
      gridApiRef.current?.deselectAll()
      refreshGrid()
    },
    [refreshGrid, stage]
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
        rowCount={rowCount}
        onAdd={addRow}
        onDeleteSelected={deleteSelected}
        onExport={exportCsv}
      />

      <div className='min-h-0 flex-1'>
        <AgGridReact<Creator>
          theme={resolvedTheme === 'dark' ? darkTheme : baseTheme}
          rowModelType='infinite'
          datasource={datasource}
          cacheBlockSize={PAGE_SIZE}
          cacheOverflowSize={2}
          maxConcurrentDatasourceRequests={1}
          infiniteInitialRowCount={PAGE_SIZE}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          context={gridContext}
          getRowId={getRowId}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          cellSelection={{ handle: { mode: 'range' } }}
          getContextMenuItems={getContextMenuItems}
          statusBar={statusBar}
          rowSelection={{
            mode: 'multiRow',
            enableClickSelection: true,
            enableSelectionWithoutKeys: true,
          }}
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
