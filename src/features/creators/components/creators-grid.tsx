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
import { useLanguage } from '@/context/language-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  type Creator,
  type CreatorStage,
  collabTypeOptions,
  contentCategoryOptions,
  contentTypeOptions,
  dedupOptions,
  executionOptions,
  followerTierOptions,
  newCreatorId,
  reviewOptions,
  workingStatusOptions,
} from '../data/data'
import {
  BadgeRenderer,
  ComboboxCellEditor,
  DateCellEditor,
  DateRenderer,
  DedupRenderer,
  ReviewRenderer,
  WorkingStatusRenderer,
} from './cell-editors'
import { CreatorCellRenderer, type CreatorGridContext } from './creator-cell'
import { CreatorEditDialog } from './creator-edit-dialog'

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])
LicenseManager.setLicenseKey('')

const baseTheme = themeQuartz
const darkTheme = themeQuartz.withPart(colorSchemeDark)

const usdFormatter = (params: ValueFormatterParams<Creator, number>) => {
  if (params.value == null || Number.isNaN(params.value)) return ''
  return `$${Number(params.value).toLocaleString('en-US')}`
}

const numberFormatter = (params: ValueFormatterParams<Creator, number>) => {
  if (params.value == null || Number.isNaN(params.value)) return ''
  return Number(params.value).toLocaleString('en-US')
}

const percentFormatter = (params: ValueFormatterParams<Creator, number>) => {
  if (params.value == null || Number.isNaN(params.value)) return ''
  return `${Math.round(Number(params.value) * 100)}%`
}

type CreatorsGridProps = {
  stage: CreatorStage
  rows: Creator[]
  setRows: React.Dispatch<React.SetStateAction<Creator[]>>
}

export function CreatorsGrid({ stage, rows, setRows }: CreatorsGridProps) {
  const { resolvedTheme } = useTheme()
  const { t } = useLanguage()
  const gridApiRef = useRef<GridApi<Creator> | null>(null)
  const [editing, setEditing] = useState<Creator | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const onGridReady = useCallback((e: GridReadyEvent<Creator>) => {
    gridApiRef.current = e.api
  }, [])

  const onEditCreator = useCallback((creator: Creator) => {
    setEditing(creator)
    setDialogOpen(true)
  }, [])

  const gridContext = useMemo<CreatorGridContext>(
    () => ({ onEditCreator }),
    [onEditCreator]
  )

  const saveCreator = useCallback(
    (updated: Creator) => {
      setRows((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...updated } : r))
      )
      gridApiRef.current?.applyTransaction({ update: [updated] })
    },
    [setRows]
  )

  const combo = (
    options: readonly string[],
    variant: 'plain' | 'badge' | 'review' | 'dedup' | 'working' = 'plain',
    allowCustom = false
  ): Partial<ColDef<Creator>> => ({
    cellEditor: ComboboxCellEditor,
    cellEditorPopup: true,
    cellEditorPopupPosition: 'under',
    cellEditorParams: { options, variant, allowCustom },
  })

  const columnDefs = useMemo<ColDef<Creator>[]>(
    () => [
      {
        headerName: '达人',
        colId: 'creator',
        field: 'tiktokId',
        width: 220,
        pinned: 'left',
        editable: false,
        filter: true,
        cellRenderer: CreatorCellRenderer,
      },
      {
        field: 'dedup',
        headerName: '查重',
        width: 110,
        enableRowGroup: true,
        cellRenderer: DedupRenderer,
        ...combo(dedupOptions, 'dedup'),
      },
      {
        field: 'series',
        headerName: 'Series',
        width: 120,
        enableRowGroup: true,
      },
      {
        field: 'review',
        headerName: '审核',
        width: 120,
        enableRowGroup: true,
        cellRenderer: ReviewRenderer,
        ...combo(reviewOptions, 'review'),
      },
      {
        field: 'notApprovalReason',
        headerName: 'Not Approval Reason',
        minWidth: 180,
      },
      {
        field: 'agreedVideos',
        headerName: '约定视频数',
        width: 120,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
      },
      {
        field: 'completedVideos',
        headerName: '已完成视频条数',
        width: 140,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
      },
      {
        field: 'dateRegistration',
        headerName: 'Date Registration',
        width: 150,
        cellRenderer: DateRenderer,
        cellEditor: DateCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
      },
      {
        field: 'bd',
        headerName: 'BD',
        width: 110,
        enableRowGroup: true,
        cellRenderer: BadgeRenderer,
        ...combo(['Anna', 'Bella', 'Chris', 'David', 'Elena'], 'badge', true),
      },
      { field: 'profile', headerName: 'Profile', minWidth: 200 },
      {
        field: 'follower',
        headerName: 'Follower',
        width: 130,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
        valueFormatter: numberFormatter,
        enableValue: true,
        aggFunc: 'sum',
      },
      {
        field: 'followerTier',
        headerName: 'Follower Tier',
        width: 150,
        enableRowGroup: true,
        ...combo(followerTierOptions),
      },
      {
        field: 'workingStatus',
        headerName: 'Working Status',
        width: 140,
        enableRowGroup: true,
        cellRenderer: WorkingStatusRenderer,
        ...combo(workingStatusOptions, 'working'),
      },
      {
        field: 'contentCategory',
        headerName: '内容类目 Content Category',
        width: 160,
        enableRowGroup: true,
        cellRenderer: BadgeRenderer,
        ...combo(contentCategoryOptions, 'badge', true),
      },
      {
        field: 'influencerFeatures',
        headerName: '博主特点 Influencer Features',
        minWidth: 170,
      },
      {
        field: 'collabType',
        headerName: 'Collab Type 合作类型',
        width: 150,
        enableRowGroup: true,
        ...combo(collabTypeOptions),
      },
      {
        field: 'contentType',
        headerName: 'Content Type',
        width: 140,
        enableRowGroup: true,
        ...combo(contentTypeOptions),
      },
      { field: 'whatsapp', headerName: 'Whatsapp', width: 150 },
      { field: 'instagram', headerName: 'Instagram', width: 140 },
      { field: 'facebook', headerName: 'Facebook', width: 140 },
      { field: 'email', headerName: 'Email', minWidth: 180 },
      {
        field: 'collabDate',
        headerName: 'Collab Date',
        width: 140,
        cellRenderer: DateRenderer,
        cellEditor: DateCellEditor,
        cellEditorPopup: true,
        cellEditorPopupPosition: 'under',
      },
      {
        field: 'collabAmount',
        headerName: 'Collab Amount',
        width: 140,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
        valueFormatter: usdFormatter,
        enableValue: true,
        aggFunc: 'sum',
      },
      {
        field: 'videoAmount',
        headerName: 'Video Amount',
        width: 130,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
      },
      {
        field: 'gmv',
        headerName: 'GMV',
        width: 130,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
        valueFormatter: usdFormatter,
        enableValue: true,
        aggFunc: 'sum',
      },
      {
        field: 'avgExposure',
        headerName: 'AVG Exposure Count',
        width: 160,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
        valueFormatter: numberFormatter,
      },
      { field: 'collabSku', headerName: 'Collab SKU', width: 130 },
      {
        field: 'fulfilledCollab',
        headerName: 'Fulfilled Collab 履约数',
        width: 150,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
      },
      {
        field: 'fulfilledRate',
        headerName: 'Fulfilled Rate 履约率',
        width: 150,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: { min: 0, max: 1, precision: 2, step: 0.01 },
        valueFormatter: percentFormatter,
      },
      {
        field: 'avgPublishDays',
        headerName: '平均发布用时',
        width: 130,
        type: 'rightAligned',
        cellEditor: 'agNumberCellEditor',
        valueFormatter: (p) => (p.value == null ? '' : `${p.value} 天`),
      },
      {
        field: 'execution',
        headerName: '执行力 Execution',
        width: 140,
        enableRowGroup: true,
        cellRenderer: BadgeRenderer,
        ...combo(executionOptions, 'badge'),
      },
    ],
    []
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
          statusPanelParams: { aggFuncs: ['count', 'sum', 'avg', 'min', 'max'] },
        },
      ],
    }),
    []
  )

  const getRowId = useCallback((params: { data: Creator }) => params.data.id, [])

  const onCellValueChanged = useCallback(
    (e: CellValueChangedEvent<Creator>) => {
      const updated = e.data
      setRows((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...updated } : r))
      )
    },
    [setRows]
  )

  const addRow = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10)
    const blank: Creator = {
      id: newCreatorId(),
      dedup: '未查重',
      tiktokId: '',
      series: '',
      review: '待审核',
      notApprovalReason: '',
      agreedVideos: 0,
      completedVideos: 0,
      dateRegistration: today,
      bd: '',
      profile: '',
      follower: 0,
      followerTier: followerTierOptions[0],
      workingStatus: '未开始',
      contentCategory: '',
      influencerFeatures: '',
      collabType: collabTypeOptions[0],
      contentType: contentTypeOptions[0],
      whatsapp: '',
      instagram: '',
      facebook: '',
      email: '',
      collabDate: today,
      collabAmount: 0,
      videoAmount: 0,
      gmv: 0,
      avgExposure: 0,
      collabSku: '',
      fulfilledCollab: 0,
      fulfilledRate: 0,
      avgPublishDays: 0,
      execution: executionOptions[0],
    }
    setRows((prev) => [blank, ...prev])
    onEditCreator(blank)
  }, [onEditCreator, setRows])

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

  const deleteRowsByIds = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      const idSet = new Set(ids)
      setRows((prev) => prev.filter((r) => !idSet.has(r.id)))
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
          action: () => {
            if (params.node?.data) onEditCreator(params.node.data)
          },
        },
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
    [addRow, deleteRowsByIds, getSelectedRowIds, onEditCreator]
  )

  return (
    <div className='flex flex-1 flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button size='sm' onClick={addRow}>
          <Plus className='size-4' />
          {t('creators.addRow')}
        </Button>
        <Button size='sm' variant='outline' onClick={deleteSelected}>
          <Trash2 className='size-4' />
          {t('creators.deleteRow')}
        </Button>
        <Button size='sm' variant='outline' onClick={exportCsv}>
          <Download className='size-4' />
          {t('creators.export')}
        </Button>
        <p className='text-muted-foreground ms-auto text-sm'>
          {t('creators.rowCount', { count: rows.length })}
        </p>
      </div>

      <div className='min-h-0 flex-1'>
        <AgGridReact<Creator>
          theme={resolvedTheme === 'dark' ? darkTheme : baseTheme}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          context={gridContext}
          getRowId={getRowId}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          cellSelection={{ handle: { mode: 'range' } }}
          getContextMenuItems={getContextMenuItems}
          sideBar={sideBar}
          statusBar={statusBar}
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
        creator={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={saveCreator}
      />
    </div>
  )
}
