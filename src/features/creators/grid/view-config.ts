// Per-stage configuration for the filter bar and the Kanban board.
//
// - `filterConfigByStage` decides which categorical fields become dropdown
//   filters above the table (chosen from the most meaningful columns of each
//   stage). A global text search is always available.
// - `kanbanConfigByStage` picks the single most important "status" field of
//   each stage and turns it into swim-lanes for the Kanban view.

import {
  collabStatusOptions,
  collabTypeOptions,
  contentCategoryOptions,
  countryOptions,
  followerTierOptions,
  influencerCategoryOptions,
  presentationStyleOptions,
  reviewColorMap,
  reviewOptions,
  workingStatusColorMap,
  workingStatusOptions,
  yesNoOptions,
  type Creator,
  type CreatorStage,
} from '../data/data'

export const bdOptions = ['Anna', 'Bella', 'Chris', 'David', 'Elena'] as const
export const brandOptions = ['Dohozz', 'Grid', 'Nova', 'Luma'] as const

/** Sentinel value for the "all" option in a Select (Radix disallows ''). */
export const ALL_VALUE = '__all__'

export type FilterState = {
  search: string
  selects: Partial<Record<keyof Creator, string>>
}

export const emptyFilterState: FilterState = { search: '', selects: {} }

export type SelectFilterDef = {
  field: keyof Creator
  label: string
  options: readonly string[]
}

export type StageFilterConfig = {
  searchPlaceholder: string
  selects: SelectFilterDef[]
}

export const filterConfigByStage: Record<CreatorStage, StageFilterConfig> = {
  outreach: {
    searchPlaceholder: '搜索 Tiktok ID / 系列 / BD…',
    selects: [
      { field: 'review', label: '审核', options: reviewOptions },
      {
        field: 'workingStatus',
        label: 'Working Status',
        options: workingStatusOptions,
      },
      { field: 'followerTier', label: 'Follower Tier', options: followerTierOptions },
      { field: 'bd', label: 'BD', options: bdOptions },
      { field: 'contentCategory', label: '内容类目', options: contentCategoryOptions },
      { field: 'collabType', label: 'Collab Type', options: collabTypeOptions },
    ],
  },
  samples: {
    searchPlaceholder: '搜索 合作编码 / Tiktok ID / SKU…',
    selects: [
      { field: 'collabStatus', label: '合作状态', options: collabStatusOptions },
      { field: 'bd', label: 'BD', options: bdOptions },
      { field: 'brand', label: '品牌', options: brandOptions },
      { field: 'collabType', label: 'Collab Type', options: collabTypeOptions },
      { field: 'hasSales', label: '是否出单', options: yesNoOptions },
      { field: 'followerTier', label: 'Follower Tier', options: followerTierOptions },
    ],
  },
  videos: {
    searchPlaceholder: '搜索 Tiktok ID / 系列 / SKU…',
    selects: [
      { field: 'review', label: '审核', options: reviewOptions },
      {
        field: 'influencerCategory',
        label: 'Influencer Category',
        options: influencerCategoryOptions,
      },
      {
        field: 'presentationStyle',
        label: 'Presentation Style',
        options: presentationStyleOptions,
      },
      { field: 'country', label: 'Country', options: countryOptions },
      { field: 'hasSales', label: '是否出单', options: yesNoOptions },
      { field: 'followerTier', label: 'Follower Tier', options: followerTierOptions },
    ],
  },
}

export type KanbanColumnDef = {
  value: string
  color: string
}

export type KanbanConfig = {
  /** The status field this board groups by. */
  field: keyof Creator
  label: string
  columns: KanbanColumnDef[]
}

const collabStatusColorMap: Record<string, string> = {
  待寄样: 'var(--muted-foreground)',
  已寄样: 'var(--chart-2)',
  运输中: 'var(--chart-4)',
  已签收: 'var(--chart-3)',
  已取消: 'var(--destructive)',
}

function toColumns(
  options: readonly string[],
  colorMap: Record<string, string>
): KanbanColumnDef[] {
  return options.map((value) => ({
    value,
    color: colorMap[value] ?? 'var(--muted-foreground)',
  }))
}

// Most important status per stage:
//   outreach → Working Status (合作推进管线)
//   samples  → 合作状态 (寄样履约管线)
//   videos   → 审核 (视频验收状态)
export const kanbanConfigByStage: Record<CreatorStage, KanbanConfig> = {
  outreach: {
    field: 'workingStatus',
    label: 'Working Status',
    columns: toColumns(workingStatusOptions, workingStatusColorMap),
  },
  samples: {
    field: 'collabStatus',
    label: '合作状态',
    columns: toColumns(collabStatusOptions, collabStatusColorMap),
  },
  videos: {
    field: 'review',
    label: '视频审核',
    columns: toColumns(reviewOptions, reviewColorMap),
  },
}
