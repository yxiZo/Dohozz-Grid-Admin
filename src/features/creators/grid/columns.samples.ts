import { type ColDef } from 'ag-grid-community'
import { BadgeRenderer } from '../components/cell-editors'
import {
  collabStatusOptions,
  collabTypeOptions,
  followerTierOptions,
  yesNoOptions,
  type Creator,
} from '../data/data'
import {
  baseCreatorColumn,
  comboColumn,
  countryColumn,
  dateColumn,
  moneyColumn,
  percentFormatter,
  teamColumn,
} from './column-helpers'

export const sampleColumns: ColDef<Creator>[] = [
  {
    field: 'collabCode',
    headerName: 'Collab 合作编码',
    width: 160,
    pinned: 'left',
  },
  baseCreatorColumn,
  teamColumn,
  countryColumn,
  {
    field: 'bd',
    headerName: 'BD',
    width: 110,
    enableRowGroup: true,
    cellRenderer: BadgeRenderer,
    ...comboColumn(['Anna', 'Bella', 'Chris', 'David', 'Elena'], 'badge', true),
  },
  {
    field: 'dateSampleSend',
    headerName: 'Date Sample Send 寄样时间',
    width: 190,
    ...dateColumn(),
  },
  { field: 'brand', headerName: '品牌', width: 120, enableRowGroup: true },
  {
    field: 'series',
    headerName: 'Series 系列',
    width: 140,
    enableRowGroup: true,
  },
  { field: 'sku', headerName: 'SKU', width: 130 },
  {
    field: 'collabType',
    headerName: 'Collab Type',
    width: 150,
    enableRowGroup: true,
    ...comboColumn(collabTypeOptions),
  },
  {
    field: 'collabStatus',
    headerName: 'Collab Status 合作状态',
    width: 180,
    enableRowGroup: true,
    cellRenderer: BadgeRenderer,
    ...comboColumn(collabStatusOptions, 'badge'),
  },
  {
    field: 'followerTier',
    headerName: 'Follower Tier',
    width: 150,
    enableRowGroup: true,
    ...comboColumn(followerTierOptions),
  },
  { field: 'videoLink', headerName: 'Video Link', minWidth: 220 },
  {
    field: 'gmv',
    headerName: 'GMV',
    width: 130,
    ...moneyColumn(),
  },
  {
    field: 'hasSales',
    headerName: '是否出单达人',
    width: 140,
    enableRowGroup: true,
    cellRenderer: BadgeRenderer,
    ...comboColumn(yesNoOptions, 'badge'),
  },
  {
    field: 'fulfilledRate',
    headerName: '完成度',
    width: 120,
    type: 'rightAligned',
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: { min: 0, max: 1, precision: 2, step: 0.01 },
    valueFormatter: percentFormatter,
  },
]
