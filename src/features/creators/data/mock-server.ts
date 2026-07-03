// A fake "backend" for the creators grid.
//
// Instead of holding every row in the React tree and paginating on the client,
// the AG Grid uses the Infinite Row Model and asks this module for one block of
// rows at a time (see `fetchCreators`). Sorting and filtering are also resolved
// here, exactly like a real REST/GraphQL endpoint would.
//
// The data lives in a mutable in-memory "database" so edits / inserts / deletes
// survive across block requests.

import {
  type Creator,
  type CreatorStage,
  seededCreators,
} from './data'

/** Rows fetched per request. 5 blocks -> ~5 "pages" of data. */
export const PAGE_SIZE = 20
const TOTAL_PER_STAGE = 100

// Mutable in-memory store, one dataset per stage.
const db: Record<CreatorStage, Creator[]> = {
  outreach: seededCreators('outreach', TOTAL_PER_STAGE),
  samples: seededCreators('samples', TOTAL_PER_STAGE),
  videos: seededCreators('videos', TOTAL_PER_STAGE),
}

export type SortModelItem = { colId: string; sort: 'asc' | 'desc' }

export type FetchParams = {
  stage: CreatorStage
  startRow: number
  endRow: number
  sortModel?: SortModelItem[]
  // AG Grid filter model – shape depends on the filter type.
  filterModel?: Record<string, AnyFilter>
  /** Free-text search matched (OR) across a set of common text fields. */
  search?: string
}

/** Fields the global search box matches against. */
const SEARCH_FIELDS: (keyof Creator)[] = [
  'tiktokId',
  'series',
  'bd',
  'brand',
  'email',
  'contentCategory',
  'collabCode',
  'sku',
]

export type FetchResult = {
  rows: Creator[]
  /** Total number of rows AFTER filtering (for the infinite cache). */
  rowCount: number
}

export type TextFilter = {
  filterType?: 'text'
  type: string
  filter?: string
}
export type NumberFilter = {
  filterType?: 'number'
  type: string
  filter?: number
  filterTo?: number
}
export type SetFilter = {
  filterType: 'set'
  values: string[]
}
export type CombinedFilter = {
  operator: 'AND' | 'OR'
  conditions: AnyFilter[]
}
export type AnyFilter = TextFilter | NumberFilter | SetFilter | CombinedFilter

function matchText(value: unknown, cond: TextFilter): boolean {
  const v = String(value ?? '').toLowerCase()
  const f = String(cond.filter ?? '').toLowerCase()
  switch (cond.type) {
    case 'contains':
      return v.includes(f)
    case 'notContains':
      return !v.includes(f)
    case 'equals':
      return v === f
    case 'notEqual':
      return v !== f
    case 'startsWith':
      return v.startsWith(f)
    case 'endsWith':
      return v.endsWith(f)
    case 'blank':
      return v === ''
    case 'notBlank':
      return v !== ''
    default:
      return true
  }
}

function matchNumber(value: unknown, cond: NumberFilter): boolean {
  const v = Number(value)
  const f = Number(cond.filter)
  const t = Number(cond.filterTo)
  switch (cond.type) {
    case 'equals':
      return v === f
    case 'notEqual':
      return v !== f
    case 'greaterThan':
      return v > f
    case 'greaterThanOrEqual':
      return v >= f
    case 'lessThan':
      return v < f
    case 'lessThanOrEqual':
      return v <= f
    case 'inRange':
      return v >= f && v <= t
    case 'blank':
      return value === null || value === undefined || value === ''
    case 'notBlank':
      return !(value === null || value === undefined || value === '')
    default:
      return true
  }
}

function matchOne(value: unknown, cond: AnyFilter): boolean {
  if ('operator' in cond) {
    const results = cond.conditions.map((c) => matchOne(value, c))
    return cond.operator === 'AND'
      ? results.every(Boolean)
      : results.some(Boolean)
  }
  if (cond.filterType === 'set') {
    return cond.values.includes(String(value ?? ''))
  }
  if (cond.filterType === 'number') {
    return matchNumber(value, cond as NumberFilter)
  }
  // Default to text semantics.
  return matchText(value, cond as TextFilter)
}

function applyFilter(
  rows: Creator[],
  filterModel?: Record<string, AnyFilter>
): Creator[] {
  if (!filterModel || Object.keys(filterModel).length === 0) return rows
  return rows.filter((row) =>
    Object.entries(filterModel).every(([field, cond]) =>
      matchOne((row as Record<string, unknown>)[field], cond)
    )
  )
}

function applySearch(rows: Creator[], search?: string): Creator[] {
  const q = search?.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) =>
    SEARCH_FIELDS.some((field) =>
      String((row as Record<string, unknown>)[field] ?? '')
        .toLowerCase()
        .includes(q)
    )
  )
}

function applySort(rows: Creator[], sortModel?: SortModelItem[]): Creator[] {
  if (!sortModel || sortModel.length === 0) return rows
  const sorted = [...rows]
  sorted.sort((a, b) => {
    for (const { colId, sort } of sortModel) {
      const av = (a as Record<string, unknown>)[colId]
      const bv = (b as Record<string, unknown>)[colId]
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''))
      if (cmp !== 0) return sort === 'asc' ? cmp : -cmp
    }
    return 0
  })
  return sorted
}

/**
 * Simulates a paginated API call: filters, sorts, then returns a single block
 * of rows plus the total filtered count, after a random network-like delay.
 */
export function fetchCreators({
  stage,
  startRow,
  endRow,
  sortModel,
  filterModel,
  search,
}: FetchParams): Promise<FetchResult> {
  return new Promise((resolve) => {
    const latency = 300 + Math.random() * 500
    setTimeout(() => {
      const searched = applySearch(db[stage], search)
      const filtered = applyFilter(searched, filterModel)
      const ordered = applySort(filtered, sortModel)
      const rows = ordered.slice(startRow, endRow).map((r) => ({ ...r }))
      // eslint-disable-next-line no-console
      console.log(
        `[v0] mock API GET /creators?stage=${stage}&start=${startRow}&end=${endRow} -> ${rows.length} rows (total ${ordered.length})`
      )
      resolve({ rows, rowCount: ordered.length })
    }, latency)
  })
}

export type SelectParams = {
  stage: CreatorStage
  search?: string
  filterModel?: Record<string, AnyFilter>
}

/**
 * Synchronous read of the (search + filter) matched rows for a stage.
 * Used by the Kanban board, which groups every matching row by status
 * rather than paging – so it reads the in-memory store directly.
 */
export function selectCreators({
  stage,
  search,
  filterModel,
}: SelectParams): Creator[] {
  const searched = applySearch(db[stage], search)
  return applyFilter(searched, filterModel).map((r) => ({ ...r }))
}

/** Update a single field (e.g. Kanban status) on a creator. */
export function updateCreatorField(
  stage: CreatorStage,
  id: string,
  field: keyof Creator,
  value: Creator[keyof Creator]
): void {
  const row = db[stage].find((r) => r.id === id)
  if (!row) return
  ;(row as Record<string, unknown>)[field as string] = value
  // eslint-disable-next-line no-console
  console.log(
    `[v0] mock API PATCH /creators/${id} { ${String(field)}: ${String(value)} }`
  )
}

/** Total (unfiltered) rows currently in the store for a stage. */
export function getRowCount(stage: CreatorStage): number {
  return db[stage].length
}

/** Insert or update a creator, returning the new total row count. */
export function upsertCreator(stage: CreatorStage, creator: Creator): number {
  const list = db[stage]
  const idx = list.findIndex((row) => row.id === creator.id)
  if (idx === -1) {
    list.unshift({ ...creator })
  } else {
    list[idx] = { ...creator }
  }
  return list.length
}

/** Delete creators by id, returning the new total row count. */
export function deleteCreators(stage: CreatorStage, ids: string[]): number {
  if (ids.length === 0) return db[stage].length
  const idSet = new Set(ids)
  db[stage] = db[stage].filter((row) => !idSet.has(row.id))
  return db[stage].length
}
