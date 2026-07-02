// Dashboard metrics layer.
//
// The dashboard is a role-based analytics workbench. All numbers are derived
// from the shared creator mock dataset (creatorsByStage) so the three role
// views (BD / Lead / Admin) stay internally consistent. A time-period factor
// scales the "monthly snapshot" dataset down to week / day granularity so the
// unified period switcher produces believable numbers.

import {
  bdOptions,
  contentCategoryOptions,
  countryOptions,
  creatorsByStage,
  type Creator,
} from '@/features/creators/data/data'

export type DashboardRole = 'bd' | 'lead' | 'admin'
export type TimePeriod = 'day' | 'week' | 'month'

export const roleOptions: { value: DashboardRole; zh: string; en: string }[] = [
  { value: 'bd', zh: 'BD 运营', en: 'BD / Operations' },
  { value: 'lead', zh: '部门领导', en: 'Department Lead' },
  { value: 'admin', zh: '超级管理员', en: 'Super Admin' },
]

export const periodOptions: {
  value: TimePeriod
  zh: string
  en: string
}[] = [
  { value: 'day', zh: '今日', en: 'Today' },
  { value: 'week', zh: '本周', en: 'This Week' },
  { value: 'month', zh: '本月', en: 'This Month' },
]

// How much of the "month" snapshot a shorter period represents.
const PERIOD_FACTOR: Record<TimePeriod, number> = {
  day: 1 / 22,
  week: 1 / 4,
  month: 1,
}

const periodTrendConfig: Record<
  TimePeriod,
  { zhLabels: string[]; enLabels: string[] }
> = {
  day: {
    zhLabels: ['08', '10', '12', '14', '16', '18', '20', '22'],
    enLabels: ['08', '10', '12', '14', '16', '18', '20', '22'],
  },
  week: {
    zhLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    enLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  month: {
    zhLabels: ['第1周', '第2周', '第3周', '第4周'],
    enLabels: ['W1', 'W2', 'W3', 'W4'],
  },
}

// ----- deterministic pseudo-random helpers (stable across renders) -----

function hashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A stable delta (period-over-period change) for a metric.
function deltaFor(seedKey: string): number {
  const rng = mulberry32(hashSeed(seedKey))
  // range roughly -18% .. +42%
  return Math.round((rng() * 60 - 18) * 10) / 10
}

const allStages: Creator[] = [
  ...creatorsByStage.outreach,
  ...creatorsByStage.samples,
  ...creatorsByStage.videos,
]

function scale(value: number, period: TimePeriod): number {
  return value * PERIOD_FACTOR[period]
}

function round(n: number): number {
  return Math.round(n)
}

function roundGmv(n: number): number {
  return Math.round(n / 100) * 100
}

export type Kpi = {
  key: string
  labelZh: string
  labelEn: string
  value: number
  format: 'int' | 'currency' | 'percent'
  delta: number
  hintZh?: string
  hintEn?: string
}

export function formatKpiValue(value: number, format: Kpi['format']): string {
  if (format === 'currency') {
    return `$${Math.round(value).toLocaleString('en-US')}`
  }
  if (format === 'percent') {
    return `${value.toFixed(1)}%`
  }
  return Math.round(value).toLocaleString('en-US')
}

// ------------------------------- BD view -------------------------------

export function bdList(): string[] {
  return [...bdOptions]
}

export function getBdKpis(bd: string, period: TimePeriod): Kpi[] {
  const outreach = creatorsByStage.outreach.filter((c) => c.bd === bd)
  const samples = creatorsByStage.samples.filter((c) => c.bd === bd)
  const videos = creatorsByStage.videos.filter((c) => c.bd === bd)

  const monthlyOutreach = outreach.length * 6
  const monthlySamples = samples.length * 6
  const passedVideos =
    videos.reduce((s, c) => s + c.completedVideos, 0) * 6
  const gmv = videos.reduce((s, c) => s + c.gmv, 0)
  const fulfilled =
    videos.length > 0
      ? (videos.reduce((s, c) => s + c.fulfilledRate, 0) / videos.length) * 100
      : 0

  return [
    {
      key: 'outreach',
      labelZh: '新增建联',
      labelEn: 'New Outreach',
      value: round(scale(monthlyOutreach, period)),
      format: 'int',
      delta: deltaFor(`${bd}-outreach-${period}`),
      hintZh: '本期新建联达人数',
      hintEn: 'Creators contacted this period',
    },
    {
      key: 'samples',
      labelZh: '寄样数',
      labelEn: 'Samples Sent',
      value: round(scale(monthlySamples, period)),
      format: 'int',
      delta: deltaFor(`${bd}-samples-${period}`),
      hintZh: '本期寄出样品数',
      hintEn: 'Samples shipped this period',
    },
    {
      key: 'videos',
      labelZh: '视频通过',
      labelEn: 'Videos Accepted',
      value: round(scale(passedVideos, period)),
      format: 'int',
      delta: deltaFor(`${bd}-videos-${period}`),
      hintZh: '本期验收通过视频数',
      hintEn: 'Videos accepted this period',
    },
    {
      key: 'gmv',
      labelZh: '我的 GMV',
      labelEn: 'My GMV',
      value: roundGmv(scale(gmv, period)),
      format: 'currency',
      delta: deltaFor(`${bd}-gmv-${period}`),
      hintZh: '本期带货成交额',
      hintEn: 'Attributed sales this period',
    },
    {
      key: 'fulfilled',
      labelZh: '履约率',
      labelEn: 'Fulfillment Rate',
      value: fulfilled,
      format: 'percent',
      delta: deltaFor(`${bd}-fulfilled-${period}`),
      hintZh: '约定视频完成比例',
      hintEn: 'Agreed videos delivered',
    },
  ]
}

export type FunnelStage = {
  labelZh: string
  labelEn: string
  value: number
}

// Build a clean, monotonically-decreasing funnel. The mock generator
// correlates `bd` and `review`, which can produce degenerate funnels for some
// BDs, so we derive each stage as a ratio of the previous one with a small
// deterministic per-BD variation.
function buildFunnel(seedKey: string, top: number, period: TimePeriod): FunnelStage[] {
  const rng = mulberry32(hashSeed(seedKey))
  const approveRate = 0.68 + rng() * 0.12
  const sampleRate = 0.6 + rng() * 0.15
  const orderRate = 0.45 + rng() * 0.2
  const built = top
  const approved = built * approveRate
  const sampled = approved * sampleRate
  const ordered = sampled * orderRate
  return [
    { labelZh: '建联', labelEn: 'Outreach', value: round(scale(built, period)) },
    {
      labelZh: '审核通过',
      labelEn: 'Approved',
      value: round(scale(approved, period)),
    },
    {
      labelZh: '已寄样',
      labelEn: 'Sampled',
      value: round(scale(sampled, period)),
    },
    {
      labelZh: '已出单',
      labelEn: 'Converted',
      value: round(scale(ordered, period)),
    },
  ]
}

export function getBdFunnel(bd: string, period: TimePeriod): FunnelStage[] {
  const built = creatorsByStage.outreach.filter((c) => c.bd === bd).length * 6
  return buildFunnel(`funnel-${bd}`, built, period)
}

export type BdTask = {
  key: string
  labelZh: string
  labelEn: string
  count: number
  tone: 'default' | 'warning' | 'danger'
}

export function getBdTasks(bd: string): BdTask[] {
  const outreach = creatorsByStage.outreach.filter((c) => c.bd === bd)
  const samples = creatorsByStage.samples.filter((c) => c.bd === bd)
  const videos = creatorsByStage.videos.filter((c) => c.bd === bd)

  return [
    {
      key: 'review',
      labelZh: '待审核提报',
      labelEn: 'Pending Review',
      count: outreach.filter((c) => c.review === '待审核').length,
      tone: 'warning',
    },
    {
      key: 'dedup',
      labelZh: '待查重达人',
      labelEn: 'Pending Dedup',
      count: outreach.filter((c) => c.dedup === '未查重').length,
      tone: 'default',
    },
    {
      key: 'ship',
      labelZh: '待寄样',
      labelEn: 'Awaiting Shipment',
      count: samples.filter((c) => c.collabStatus === '待寄样').length,
      tone: 'warning',
    },
    {
      key: 'accept',
      labelZh: '待验收视频',
      labelEn: 'Videos to Verify',
      count: videos.filter((c) => c.completedVideos < c.agreedVideos).length,
      tone: 'danger',
    },
  ]
}

export type CreatorRow = {
  id: string
  handle: string
  country: string
  category: string
  gmv: number
  status: string
}

export function getBdTopCreators(bd: string, limit = 5): CreatorRow[] {
  return creatorsByStage.videos
    .filter((c) => c.bd === bd)
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      handle: c.tiktokId,
      country: c.country,
      category: c.contentCategory,
      gmv: c.gmv,
      status: c.workingStatus,
    }))
}

export type TargetProgress = {
  labelZh: string
  labelEn: string
  current: number
  target: number
  format: Kpi['format']
}

export function getBdTargets(bd: string, period: TimePeriod): TargetProgress[] {
  const videos = creatorsByStage.videos.filter((c) => c.bd === bd)
  const gmv = roundGmv(scale(videos.reduce((s, c) => s + c.gmv, 0), period))
  const outreach = round(
    scale(creatorsByStage.outreach.filter((c) => c.bd === bd).length * 6, period)
  )
  const gmvTarget = period === 'month' ? 120000 : period === 'week' ? 30000 : 6000
  const outreachTarget = period === 'month' ? 60 : period === 'week' ? 15 : 4
  return [
    {
      labelZh: 'GMV 目标',
      labelEn: 'GMV Target',
      current: gmv,
      target: gmvTarget,
      format: 'currency',
    },
    {
      labelZh: '建联目标',
      labelEn: 'Outreach Target',
      current: outreach,
      target: outreachTarget,
      format: 'int',
    },
  ]
}

// ----------------------------- trend series -----------------------------

export type TrendPoint = {
  name: string
  gmv: number
  outreach: number
}

function buildTrend(
  seedKey: string,
  period: TimePeriod,
  lang: 'zh' | 'en',
  gmvTotal: number,
  outreachTotal: number
): TrendPoint[] {
  const cfg = periodTrendConfig[period]
  const labels = lang === 'zh' ? cfg.zhLabels : cfg.enLabels
  const rng = mulberry32(hashSeed(seedKey + period))
  const weights = labels.map(() => rng() * 0.7 + 0.5)
  const sum = weights.reduce((s, w) => s + w, 0)
  return labels.map((name, i) => ({
    name,
    gmv: roundGmv((gmvTotal * weights[i]) / sum),
    outreach: Math.max(1, round((outreachTotal * weights[i]) / sum)),
  }))
}

export function getBdTrend(
  bd: string,
  period: TimePeriod,
  lang: 'zh' | 'en'
): TrendPoint[] {
  const videos = creatorsByStage.videos.filter((c) => c.bd === bd)
  const gmv = scale(videos.reduce((s, c) => s + c.gmv, 0), period)
  const outreach = scale(
    creatorsByStage.outreach.filter((c) => c.bd === bd).length * 6,
    period
  )
  return buildTrend(`bd-${bd}`, period, lang, gmv, outreach)
}

// ------------------------------ Lead view ------------------------------

export function getTeamKpis(period: TimePeriod): Kpi[] {
  const gmv = creatorsByStage.videos.reduce((s, c) => s + c.gmv, 0)
  const outreach = creatorsByStage.outreach.length * 6
  const samples = creatorsByStage.samples.length * 6
  const activeCreators = allStages.filter(
    (c) => c.workingStatus === '已合作'
  ).length
  const fulfilled =
    creatorsByStage.videos.length > 0
      ? (creatorsByStage.videos.reduce((s, c) => s + c.fulfilledRate, 0) /
          creatorsByStage.videos.length) *
        100
      : 0

  return [
    {
      key: 'team-gmv',
      labelZh: '团队 GMV',
      labelEn: 'Team GMV',
      value: roundGmv(scale(gmv, period)),
      format: 'currency',
      delta: deltaFor(`team-gmv-${period}`),
    },
    {
      key: 'team-outreach',
      labelZh: '团队建联',
      labelEn: 'Team Outreach',
      value: round(scale(outreach, period)),
      format: 'int',
      delta: deltaFor(`team-outreach-${period}`),
    },
    {
      key: 'team-samples',
      labelZh: '团队寄样',
      labelEn: 'Team Samples',
      value: round(scale(samples, period)),
      format: 'int',
      delta: deltaFor(`team-samples-${period}`),
    },
    {
      key: 'active',
      labelZh: '活跃达人',
      labelEn: 'Active Creators',
      value: activeCreators,
      format: 'int',
      delta: deltaFor(`team-active-${period}`),
    },
    {
      key: 'team-fulfilled',
      labelZh: '团队履约率',
      labelEn: 'Team Fulfillment',
      value: fulfilled,
      format: 'percent',
      delta: deltaFor(`team-fulfilled-${period}`),
    },
  ]
}

export type LeaderboardRow = {
  bd: string
  gmv: number
  outreach: number
  fulfilled: number
}

export function getBdLeaderboard(period: TimePeriod): LeaderboardRow[] {
  return bdOptions
    .map((bd) => {
      const videos = creatorsByStage.videos.filter((c) => c.bd === bd)
      const gmv = roundGmv(scale(videos.reduce((s, c) => s + c.gmv, 0), period))
      const outreach = round(
        scale(
          creatorsByStage.outreach.filter((c) => c.bd === bd).length * 6,
          period
        )
      )
      const fulfilled =
        videos.length > 0
          ? (videos.reduce((s, c) => s + c.fulfilledRate, 0) / videos.length) *
            100
          : 0
      return { bd, gmv, outreach, fulfilled }
    })
    .sort((a, b) => b.gmv - a.gmv)
}

export function getTeamFunnel(period: TimePeriod): FunnelStage[] {
  const built = creatorsByStage.outreach.length * 6
  return buildFunnel('funnel-team', built, period)
}

export function getTeamTrend(
  period: TimePeriod,
  lang: 'zh' | 'en'
): TrendPoint[] {
  const gmv = scale(creatorsByStage.videos.reduce((s, c) => s + c.gmv, 0), period)
  const outreach = scale(creatorsByStage.outreach.length * 6, period)
  return buildTrend('team', period, lang, gmv, outreach)
}

// ------------------------------ Admin view ------------------------------

export function getPlatformKpis(period: TimePeriod): Kpi[] {
  const gmv = creatorsByStage.videos.reduce((s, c) => s + c.gmv, 0)
  const totalCreators = allStages.length
  const countries = new Set(allStages.map((c) => c.country)).size
  const brands = new Set(allStages.map((c) => c.brand)).size
  const orderRate =
    creatorsByStage.videos.length > 0
      ? (creatorsByStage.videos.filter((c) => c.hasSales === '是').length /
          creatorsByStage.videos.length) *
        100
      : 0
  const fulfilled =
    creatorsByStage.videos.length > 0
      ? (creatorsByStage.videos.reduce((s, c) => s + c.fulfilledRate, 0) /
          creatorsByStage.videos.length) *
        100
      : 0

  return [
    {
      key: 'platform-gmv',
      labelZh: '平台 GMV',
      labelEn: 'Platform GMV',
      value: roundGmv(scale(gmv, period)),
      format: 'currency',
      delta: deltaFor(`platform-gmv-${period}`),
    },
    {
      key: 'creators',
      labelZh: '达人总数',
      labelEn: 'Total Creators',
      value: totalCreators,
      format: 'int',
      delta: deltaFor(`platform-creators-${period}`),
    },
    {
      key: 'countries',
      labelZh: '覆盖国家',
      labelEn: 'Countries',
      value: countries,
      format: 'int',
      delta: 0,
    },
    {
      key: 'brands',
      labelZh: '合作品牌',
      labelEn: 'Brands',
      value: brands,
      format: 'int',
      delta: 0,
    },
    {
      key: 'order-rate',
      labelZh: '出单率',
      labelEn: 'Order Rate',
      value: orderRate,
      format: 'percent',
      delta: deltaFor(`platform-order-${period}`),
    },
    {
      key: 'platform-fulfilled',
      labelZh: '平台履约率',
      labelEn: 'Fulfillment',
      value: fulfilled,
      format: 'percent',
      delta: deltaFor(`platform-fulfilled-${period}`),
    },
  ]
}

export type Distribution = { name: string; value: number }

export function getCountryDistribution(): Distribution[] {
  return countryOptions
    .map((country) => ({
      name: country,
      value: allStages.filter((c) => c.country === country).length,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
}

export function getCategoryDistribution(): Distribution[] {
  return contentCategoryOptions
    .map((cat) => ({
      name: cat,
      value: allStages.filter((c) => c.contentCategory === cat).length,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
}

export function getPlatformTrend(
  period: TimePeriod,
  lang: 'zh' | 'en'
): TrendPoint[] {
  const gmv = scale(creatorsByStage.videos.reduce((s, c) => s + c.gmv, 0), period)
  const outreach = scale(allStages.length * 3, period)
  return buildTrend('platform', period, lang, gmv, outreach)
}
