// Creator (达人) domain model shared by all three operational stages:
//   - outreach   建联提报
//   - samples    寄样管理
//   - videos     视频验收
// Each stage exposes a different table view, while sharing one mock row model
// so creators can still be edited with a single detail dialog.

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
  /** Collab 合作编码 */
  collabCode: string
  /** Date Sample Send 寄样时间 */
  dateSampleSend: string
  /** 品牌 */
  brand: string
  /** SKU */
  sku: string
  /** Collab Status 合作状态 */
  collabStatus: string
  /** Video Link */
  videoLink: string
  /** 是否出单 / 是否出单达人 */
  hasSales: string
  /** 视频发布日期 */
  videoPublishedDate: string
  /** Date Video Post（填表日期） */
  dateVideoPost: string
  /** Video Encoding */
  videoEncoding: string
  /** Influencer Category */
  influencerCategory: string
  /** Presentation Style */
  presentationStyle: string
  /** Video Content */
  videoContent: string
  /** Video Script */
  videoScript: string
  /** Tiktok ID（链接 */
  tiktokIdLink: string
  /** Country */
  country: string
  /** 视频code */
  videoCode: string
  /** 互动量（累计） */
  cumulativeInteractions: number
  /** 点赞数 */
  likes: number
  /** 评论数 */
  comments: number
  /** 分享数 */
  shares: number
  /** 商品曝光次数（累计） */
  productExposuresCumulative: number
  /** 商品点击次数 */
  productClicks: number
  /** 互动率 (0-1) */
  interactionRate: number
  /** 成交件数 */
  dealPieces: number
  /** 脚本方向 */
  scriptDirection: string
  /** SKU副本 */
  skuCopy: string
  /** Tiktok ID副本 */
  tiktokIdCopy: string
  /** BD 副本 */
  bdCopy: string
  /** Collab Type副本 */
  collabTypeCopy: string
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
  outreach: {
    titleKey: 'creators.outreach.title',
    subtitleKey: 'creators.outreach.subtitle',
  },
  samples: {
    titleKey: 'creators.samples.title',
    subtitleKey: 'creators.samples.subtitle',
  },
  videos: {
    titleKey: 'creators.videos.title',
    subtitleKey: 'creators.videos.subtitle',
  },
}

export const dedupOptions: readonly DedupStatus[] = ['未查重', '重复', '通过']
export const reviewOptions: readonly ReviewStatus[] = [
  '待审核',
  '已通过',
  '未通过',
]
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
export const collabTypeOptions = [
  '免费寄样',
  '付费合作',
  '佣金分成',
  '混合',
] as const
export const contentTypeOptions = [
  '短视频',
  '直播',
  '图文',
  '短视频+直播',
] as const
export const bdOptions = ['Anna', 'Bella', 'Chris', 'David', 'Elena'] as const
export const executionOptions = ['优秀', '良好', '一般', '待观察'] as const
export const collabStatusOptions = [
  '待寄样',
  '已寄样',
  '运输中',
  '已签收',
  '已取消',
] as const
export const yesNoOptions = ['是', '否'] as const
export const influencerCategoryOptions = [
  '美妆',
  '科技',
  '家居',
  '生活方式',
  '母婴',
] as const
export const presentationStyleOptions = [
  '口播',
  '测评',
  '开箱',
  '教程',
  '剧情',
] as const
export const countryOptions = ['ID', 'TH', 'VN', 'PH', 'MY', 'US'] as const

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

function todayLocal() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createBlankCreator(stage: CreatorStage): Creator {
  const today = todayLocal()
  const id = newCreatorId()

  return {
    id,
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
    collabCode: stage === 'samples' ? id.replace('C-', 'COL-') : '',
    dateSampleSend: today,
    brand: '',
    sku: '',
    collabStatus: collabStatusOptions[0],
    videoLink: '',
    hasSales: yesNoOptions[1],
    videoPublishedDate: today,
    dateVideoPost: today,
    videoEncoding: '',
    influencerCategory: influencerCategoryOptions[0],
    presentationStyle: presentationStyleOptions[0],
    videoContent: '',
    videoScript: '',
    tiktokIdLink: '',
    country: countryOptions[0],
    videoCode: '',
    cumulativeInteractions: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    productExposuresCumulative: 0,
    productClicks: 0,
    interactionRate: 0,
    dealPieces: 0,
    scriptDirection: '',
    skuCopy: '',
    tiktokIdCopy: '',
    bdCopy: '',
    collabTypeCopy: collabTypeOptions[0],
    avgExposure: 0,
    collabSku: '',
    fulfilledCollab: 0,
    fulfilledRate: 0,
    avgPublishDays: 0,
    execution: executionOptions[0],
  }
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
      stage === 'videos'
        ? Math.min(agreed, i % (agreed + 1))
        : Math.max(0, i % 2)
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
      contentCategory:
        contentCategoryOptions[i % contentCategoryOptions.length],
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
      collabCode: `COL-${String(i + 1).padStart(4, '0')}`,
      dateSampleSend: daysFromNow(-(i * 2 + 2)),
      brand: ['Dohozz', 'Grid', 'Nova', 'Luma'][i % 4],
      sku: skus[i % skus.length],
      collabStatus: collabStatusOptions[i % collabStatusOptions.length],
      videoLink: `https://www.tiktok.com/@${handle}/video/${7300000000000 + i}`,
      hasSales: i % 3 === 0 ? '否' : '是',
      videoPublishedDate: daysFromNow(-(i + 1)),
      dateVideoPost: daysFromNow(-i),
      videoEncoding: `VID-${String(i + 1).padStart(5, '0')}`,
      influencerCategory:
        influencerCategoryOptions[i % influencerCategoryOptions.length],
      presentationStyle:
        presentationStyleOptions[i % presentationStyleOptions.length],
      videoContent: ['产品亮点', '场景演示', '真实测评', '优惠引导'][i % 4],
      videoScript: ['痛点引入', '卖点拆解', '使用前后对比', '福利收口'][i % 4],
      tiktokIdLink: `https://www.tiktok.com/@${handle}`,
      country: countryOptions[i % countryOptions.length],
      videoCode: `VC-${String(1000 + i)}`,
      cumulativeInteractions:
        Math.round((Math.random() * 60000 + 500) / 10) * 10,
      likes: Math.round((Math.random() * 50000 + 300) / 10) * 10,
      comments: Math.round(Math.random() * 3000 + 20),
      shares: Math.round(Math.random() * 2000 + 10),
      productExposuresCumulative:
        Math.round((Math.random() * 300000 + 3000) / 100) * 100,
      productClicks: Math.round(Math.random() * 20000 + 100),
      interactionRate: Number((Math.random() * 0.12 + 0.01).toFixed(4)),
      dealPieces: Math.round(Math.random() * 200),
      scriptDirection: ['种草', '测评', '教程', '促销'][i % 4],
      skuCopy: skus[i % skus.length],
      tiktokIdCopy: `@${handle}`,
      bdCopy: bdOptions[i % bdOptions.length],
      collabTypeCopy: collabTypeOptions[i % collabTypeOptions.length],
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
