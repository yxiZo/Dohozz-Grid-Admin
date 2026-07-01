// Creator (达人) domain model shared by all three operational stages:
//   - outreach   建联提报
//   - samples    寄样管理
//   - videos     视频验收
// The three tables use identical columns, so we abstract a single Creator
// record and drive each stage from the same data structure.

export type ReviewStatus = '待审核' | '已通过' | '未通过'
export type DedupStatus = '未查重' | '重复' | '通过'
export type WorkingStatus = '未开始' | '沟通中' | '已合作' | '已终止'

export type Creator = {
  id: string
  /** 查重 */
  dedup: DedupStatus
  /** Tiktok ID */
  tiktokId: string
  /** Series */
  series: string
  /** 审核 */
  review: ReviewStatus
  /** Not Approval Reason */
  notApprovalReason: string
  /** 约定视频数 */
  agreedVideos: number
  /** 已完成视频条数 */
  completedVideos: number
  /** Date registration */
  dateRegistration: string
  /** BD */
  bd: string
  /** Profile */
  profile: string
  /** Follower */
  follower: number
  /** Follower Tier */
  followerTier: string
  /** Working Status */
  workingStatus: WorkingStatus
  /** 内容类目 Content Category */
  contentCategory: string
  /** 博主特点 Influencer Features */
  influencerFeatures: string
  /** Collab Type 合作类型 */
  collabType: string
  /** Content Type */
  contentType: string
  /** Whatsapp */
  whatsapp: string
  /** Instagram */
  instagram: string
  /** Facebook */
  facebook: string
  /** Email */
  email: string
  /** Collab Date */
  collabDate: string
  /** Collab Amount */
  collabAmount: number
  /** Video Amount */
  videoAmount: number
  /** GMV */
  gmv: number
  /** AVG Exposure Count */
  avgExposure: number
  /** Collab SKU */
  collabSku: string
  /** Fulfilled Collab 履约数 */
  fulfilledCollab: number
  /** Fulfilled Rate 履约率 (0-1) */
  fulfilledRate: number
  /** 平均发布用时 (天) */
  avgPublishDays: number
  /** 执行力 Execution */
  execution: string
}

export type CreatorStage = 'outreach' | 'samples' | 'videos'

export const stageConfig: Record<
  CreatorStage,
  { titleKey: string; subtitleKey: string }
> = {
  outreach: { titleKey: 'creators.outreach.title', subtitleKey: 'creators.outreach.subtitle' },
  samples: { titleKey: 'creators.samples.title', subtitleKey: 'creators.samples.subtitle' },
  videos: { titleKey: 'creators.videos.title', subtitleKey: 'creators.videos.subtitle' },
}

export const dedupOptions: readonly DedupStatus[] = ['未查重', '重复', '通过']
export const reviewOptions: readonly ReviewStatus[] = ['待审核', '已通过', '未通过']
export const workingStatusOptions: readonly WorkingStatus[] = [
  '未开始',
  '沟通中',
  '已合作',
  '已终止',
]
export const followerTierOptions = [
  'Nano (<10K)',
  'Micro (10K-100K)',
  'Mid (100K-500K)',
  'Macro (500K-1M)',
  'Mega (>1M)',
] as const
export const contentCategoryOptions = [
  '美妆',
  '3C数码',
  '家居',
  '服饰',
  '母婴',
  '食品',
  '健身',
] as const
export const collabTypeOptions = ['免费寄样', '付费合作', '佣金分成', '混合'] as const
export const contentTypeOptions = ['短视频', '直播', '图文', '短视频+直播'] as const
export const bdOptions = ['Anna', 'Bella', 'Chris', 'David', 'Elena'] as const
export const executionOptions = ['优秀', '良好', '一般', '待观察'] as const

// Color tokens for status-style pills.
export const reviewColorMap: Record<string, string> = {
  待审核: 'var(--chart-4)',
  已通过: 'var(--chart-3)',
  未通过: 'var(--destructive)',
}
export const dedupColorMap: Record<string, string> = {
  未查重: 'var(--muted-foreground)',
  重复: 'var(--destructive)',
  通过: 'var(--chart-3)',
}
export const workingStatusColorMap: Record<string, string> = {
  未开始: 'var(--muted-foreground)',
  沟通中: 'var(--chart-2)',
  已合作: 'var(--chart-3)',
  已终止: 'var(--destructive)',
}

let idCounter = 0
export function newCreatorId() {
  idCounter += 1
  return `C-${Date.now().toString().slice(-6)}-${idCounter}`
}

function makeId(i: number) {
  return `TT-${String(i + 1).padStart(4, '0')}`
}

const handles = [
  'glowbyanna',
  'techwithsam',
  'homecozy',
  'stylediary',
  'mamaknows',
  'tastytrip',
  'fitwithleo',
  'beautybliss',
  'gadgetgeek',
  'dailydecor',
  'trendhunter',
  'snacklab',
]
const seriesList = ['A系列', 'B系列', 'C系列', '旗舰系列', '入门系列']
const skus = ['SKU-1001', 'SKU-1002', 'SKU-2003', 'SKU-3004', 'SKU-4005']

function daysFromNow(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function seededCreators(stage: CreatorStage, count: number): Creator[] {
  return Array.from({ length: count }).map((_, i) => {
    const handle = handles[i % handles.length]
    const follower = Math.round((Math.random() * 1_500_000 + 5000) / 100) * 100
    const tier =
      follower < 10_000
        ? followerTierOptions[0]
        : follower < 100_000
          ? followerTierOptions[1]
          : follower < 500_000
            ? followerTierOptions[2]
            : follower < 1_000_000
              ? followerTierOptions[3]
              : followerTierOptions[4]
    const agreed = (i % 4) + 1
    const completed =
      stage === 'videos' ? Math.min(agreed, (i % (agreed + 1))) : Math.max(0, (i % 2))
    const review: ReviewStatus =
      i % 5 === 0 ? '未通过' : i % 3 === 0 ? '待审核' : '已通过'
    return {
      id: `${stage}-${makeId(i)}`,
      dedup: i % 6 === 0 ? '重复' : i % 2 === 0 ? '通过' : '未查重',
      tiktokId: `@${handle}`,
      series: seriesList[i % seriesList.length],
      review,
      notApprovalReason: review === '未通过' ? '粉丝画像不匹配' : '',
      agreedVideos: agreed,
      completedVideos: completed,
      dateRegistration: daysFromNow(-(i * 3 + 5)),
      bd: bdOptions[i % bdOptions.length],
      profile: `https://www.tiktok.com/@${handle}`,
      follower,
      followerTier: tier,
      workingStatus:
        stage === 'outreach'
          ? workingStatusOptions[i % 2]
          : stage === 'samples'
            ? '沟通中'
            : '已合作',
      contentCategory: contentCategoryOptions[i % contentCategoryOptions.length],
      influencerFeatures: ['亲和力强', '专业测评', '高转化', '颜值博主'][i % 4],
      collabType: collabTypeOptions[i % collabTypeOptions.length],
      contentType: contentTypeOptions[i % contentTypeOptions.length],
      whatsapp: `+62 812-${1000 + i}-${2000 + i}`,
      instagram: `${handle}.ig`,
      facebook: `${handle}.fb`,
      email: `${handle}@example.com`,
      collabDate: daysFromNow(i % 10),
      collabAmount: Math.round((Math.random() * 8000 + 500) / 50) * 50,
      videoAmount: agreed,
      gmv: Math.round((Math.random() * 50000 + 1000) / 100) * 100,
      avgExposure: Math.round((Math.random() * 200000 + 5000) / 100) * 100,
      collabSku: skus[i % skus.length],
      fulfilledCollab: completed,
      fulfilledRate: agreed > 0 ? Number((completed / agreed).toFixed(2)) : 0,
      avgPublishDays: Math.round(Math.random() * 10 + 1),
      execution: executionOptions[i % executionOptions.length],
    }
  })
}

// Separate mock datasets per stage so edits in one stage do not affect another.
export const creatorsByStage: Record<CreatorStage, Creator[]> = {
  outreach: seededCreators('outreach', 20),
  samples: seededCreators('samples', 16),
  videos: seededCreators('videos', 14),
}
