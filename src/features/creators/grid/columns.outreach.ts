import { type ColDef } from 'ag-grid-community'
import {
  BadgeRenderer,
  WorkingStatusRenderer,
} from '../components/cell-editors'
import { ReviewActionRenderer } from '../components/creator-cell'
import {
  collabTypeOptions,
  contentCategoryOptions,
  contentTypeOptions,
  followerTierOptions,
  workingStatusOptions,
  type Creator,
} from '../data/data'
import {
  baseCreatorColumn,
  comboColumn,
  countryColumn,
  dateColumn,
  moneyColumn,
  numberColumn,
  teamColumn,
} from './column-helpers'

export const outreachColumns: ColDef<Creator>[] = [
  baseCreatorColumn,
  teamColumn,
  countryColumn,
  { field: 'series', headerName: 'Series', width: 120, enableRowGroup: true },
  {
    field: 'review',
    headerName: '审核',
    width: 150,
    enableRowGroup: true,
    // Locked from inline editing — status can only change via the gated
    // 提报审核 dialog (仅限特定人员操作).
    editable: false,
    cellRenderer: ReviewActionRenderer,
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
    headerName: 'Date registration',
    width: 150,
    ...dateColumn(),
  },
  {
    field: 'bd',
    headerName: 'BD',
    width: 110,
    enableRowGroup: true,
    cellRenderer: BadgeRenderer,
    ...comboColumn(['Anna', 'Bella', 'Chris', 'David', 'Elena'], 'badge', true),
  },
  { field: 'profile', headerName: 'Profile', minWidth: 200 },
  {
    field: 'follower',
    headerName: 'Follower',
    width: 130,
    ...numberColumn(),
    enableValue: true,
    aggFunc: 'sum',
  },
  {
    field: 'followerTier',
    headerName: 'Follower Tier',
    width: 150,
    enableRowGroup: true,
    ...comboColumn(followerTierOptions),
  },
  {
    field: 'workingStatus',
    headerName: 'Working Status',
    width: 140,
    enableRowGroup: true,
    cellRenderer: WorkingStatusRenderer,
    ...comboColumn(workingStatusOptions, 'working'),
  },
  {
    field: 'contentCategory',
    headerName: '内容类目 Content Category',
    width: 170,
    enableRowGroup: true,
    cellRenderer: BadgeRenderer,
    ...comboColumn(contentCategoryOptions, 'badge', true),
  },
  {
    field: 'influencerFeatures',
    headerName: '博主特点 Influencer Features',
    minWidth: 190,
  },
  {
    field: 'collabType',
    headerName: 'Collab Type 合作类型',
    width: 170,
    enableRowGroup: true,
    ...comboColumn(collabTypeOptions),
  },
  {
    field: 'contentType',
    headerName: 'Content Type',
    width: 140,
    enableRowGroup: true,
    ...comboColumn(contentTypeOptions),
  },
  { field: 'whatsapp', headerName: 'Whatsapp', width: 150 },
  { field: 'instagram', headerName: 'Instagram', width: 140 },
  { field: 'facebook', headerName: 'Facebook', width: 140 },
  { field: 'email', headerName: 'Email', minWidth: 180 },
  {
    field: 'collabDate',
    headerName: 'Collab Date',
    width: 140,
    ...dateColumn(),
  },
  {
    field: 'collabAmount',
    headerName: 'Collab Amount',
    width: 140,
    ...moneyColumn(),
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
    ...moneyColumn(),
  },
]
