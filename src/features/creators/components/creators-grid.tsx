import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  type AnyFilter,
  deleteCreators,
  fetchCreators,
  getRowCount,
  updateCreatorField,
  upsertCreator,
} from '../data/mock-server'
import { columnsByStage } from '../grid/columns'
import {
  ALL_VALUE,
  emptyFilterState,
  type FilterState,
  kanbanConfigByStage,
} from '../grid/view-config'
import { useReviewPermission } from '../hooks/use-review-permission'
import { type CreatorGridContext } from './creator-cell'
import { CreatorEditDialog } from './creator-edit-dialog'
import { CreatorFilterBar } from './creator-filter-bar'
import { CreatorGridToolbar, type CreatorView } from './creator-grid-toolbar'
import { CreatorKanban } from './creator-kanban'
import {
  CreatorReviewDialog,
  type ReviewDecision,
} from './creator-review-dialog'

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])
LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY ?? '')

const baseTheme = themeQuartz
const darkTheme = themeQuartz.withPart(colorSchemeDark)

type CreatorsGridProps = {
  stage: CreatorStage
  /** Reports whether the table/kanban body has been scrolled away from the top. */
  onScrolledChange?: (scrolled: boolean) => void
}

export function CreatorsGrid({ stage, onScrolledChange }: CreatorsGridProps) {
  const { resolvedTheme } = useTheme()
  const { canReview } = useReviewPermission()
  const gridApiRef = useRef<GridApi<Creator> | null>(null)
  const [editing, setEditing] = useState<Creator | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviewing, setReviewing] = useState<Creator | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rowCount, setRowCount] = useState(() => getRowCount(stage))
  const [view, setView] = useState<CreatorView>('table')
  const [filters, setFilters] = useState<FilterState>(emptyFilterState)
  // Bumped on any mutation so the (synchronous) Kanban view re-reads the store.
  const [dataVersion, setDataVersion] = useState(0)

  // Notify the parent when the body is scrolled so it can collapse the heading.
  const scrolledRef = useRef(false)
  const reportScroll = useCallback(
    (top: number) => {
      const next = top > 8
      if (next !== scrolledRef.current) {
        scrolledRef.current = next
        onScrolledChange?.(next)
      }
    },
    [onScrolledChange]
  )

  // Reset the collapsed heading whenever the view switches (table <-> kanban).
  useEffect(() => {
    scrolledRef.current = false
    onScrolledChange?.(false)
  }, [view, onScrolledChange])

  // Translate the filter-bar state into an AG Grid "set" filter model that the
  // mock backend understands. The free-text search is passed separately.
  const buildFilterModel = useCallback(
    (state: FilterState): Record<string, AnyFilter> => {
      const model: Record<string, AnyFilter> = {}
      for (const [field, value] of Object.entries(state.selects)) {
        if (value && value !== ALL_VALUE) {
          model[field] = { filterType: 'set', values: [value] }
        }
      }
      return model
    },
    []
  )

  const externalFilterModel = useMemo<Record<string, AnyFilter>>(
    () => buildFilterModel(filters),
    [buildFilterModel, filters]
  )

  // Refs so the (memoized) datasource always reads the latest filter values.
  // They are updated inside event handlers (never during render).
  const filterModelRef = useRef<Record<string, AnyFilter>>({})
  const searchRef = useRef('')

  // Infinite Row Model datasource: the grid calls getRows for each block and we
  // resolve it from the mock backend (server-side sort/filter/search/paging).
  const datasource = useMemo<IDatasource>(
    () => ({
      getRows: (params: IGetRowsParams) => {
        fetchCreators({
          stage,
          startRow: params.startRow,
          endRow: params.endRow,
          sortModel: params.sortModel,
          // Merge the toolbar filter bar with any column filters set in the grid.
          filterModel: { ...filterModelRef.current, ...params.filterModel },
          search: searchRef.current,
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
    setDataVersion((v) => v + 1)
  }, [stage])

  const onFiltersChange = useCallback(
    (next: FilterState) => {
      setFilters(next)
      // Update the refs the datasource reads, then re-run the infinite cache
      // with the new filter/search values.
      filterModelRef.current = buildFilterModel(next)
      searchRef.current = next.search
      gridApiRef.current?.refreshInfiniteCache()
    },
    [buildFilterModel]
  )

  const onStatusChange = useCallback(
    (id: string, value: string) => {
      const field = kanbanConfigByStage[stage].field
      updateCreatorField(stage, id, field, value as Creator[typeof field])
      setDataVersion((v) => v + 1)
      gridApiRef.current?.refreshInfiniteCache()
    },
    [stage]
  )

  const onGridReady = useCallback((e: GridReadyEvent<Creator>) => {
    gridApiRef.current = e.api
  }, [])

  const openEditor = useCallback((creator: Creator, asNew: boolean) => {
    setEditing({ ...creator })
    setIsNew(asNew)
    setDialogOpen(true)
  }, [])

  const onEditCreator = useCallback(
    (creator: Creator) => openEditor(creator, false),
    [openEditor]
  )

  const addRow = useCallback(() => {
    openEditor(createBlankCreator(stage), true)
  }, [openEditor, stage])

  const onReviewCreator = useCallback(
    (creator: Creator) => {
      if (!canReview) return
      setReviewing({ ...creator })
      setReviewOpen(true)
    },
    [canReview]
  )

  const gridContext = useMemo<CreatorGridContext>(
    () => ({
      onEditCreator,
      // Review is only available on the outreach stage and for permitted users.
      onReviewCreator: stage === 'outreach' ? onReviewCreator : undefined,
      canReview: stage === 'outreach' && canReview,
    }),
    [onEditCreator, onReviewCreator, canReview, stage]
  )

  const saveCreator = useCallback(
    (updated: Creator) => {
      upsertCreator(stage, updated)
      refreshGrid()
    },
    [refreshGrid, stage]
  )

  const saveReview = useCallback(
    (creator: Creator, decision: ReviewDecision) => {
      upsertCreator(stage, {
        ...creator,
        review: decision.review,
        notApprovalReason: decision.notApprovalReason,
      })
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

      const reviewItems: (DefaultMenuItem | MenuItemDef)[] =
        stage === 'outreach' && canReview
          ? [
              {
                name: '提报审核',
                disabled: !params.node?.data,
                action: () => {
                  if (params.node?.data) onReviewCreator(params.node.data)
                },
              },
              'separator',
            ]
          : []

      return [
        ...reviewItems,
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
    [
      addRow,
      deleteRowsByIds,
      getSelectedRowIds,
      onEditCreator,
      onReviewCreator,
      canReview,
      stage,
    ]
  )

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <CreatorGridToolbar
        rowCount={rowCount}
        view={view}
        onViewChange={setView}
        onAdd={addRow}
        onDeleteSelected={deleteSelected}
        onExport={exportCsv}
        filterSlot={
          <CreatorFilterBar
            stage={stage}
            value={filters}
            onChange={onFiltersChange}
          />
        }
      />

      {view === 'kanban' ? (
        <div
          className='flex min-h-0 flex-1'
          onScrollCapture={(e) =>
            reportScroll((e.target as HTMLElement).scrollTop)
          }
        >
          <CreatorKanban
            stage={stage}
            search={filters.search}
            filterModel={externalFilterModel}
            refreshKey={dataVersion}
            onEditCreator={onEditCreator}
            onStatusChange={onStatusChange}
          />
        </div>
      ) : (
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
          onBodyScroll={(e) => reportScroll(e.top)}
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
      )}

      <CreatorEditDialog
        key={`${editing?.id ?? 'empty'}-${dialogOpen ? 'open' : 'closed'}`}
        stage={stage}
        creator={editing}
        isNew={isNew}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={saveCreator}
      />

      <CreatorReviewDialog
        key={`${reviewing?.id ?? 'empty'}-${reviewOpen ? 'open' : 'closed'}`}
        creator={reviewing}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onConfirm={saveReview}
      />
    </div>
  )
}
