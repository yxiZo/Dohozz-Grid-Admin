import { z } from 'zod'

// 达人状态：对齐 influencers.status（应用层枚举校验 active/blacklisted/inactive）
const influencerStatusSchema = z.union([
  z.literal('active'),
  z.literal('blacklisted'),
  z.literal('inactive'),
])
export type InfluencerStatus = z.infer<typeof influencerStatusSchema>

// 达人来源：对齐 influencers.source（manual / scraper / referral）
const influencerSourceSchema = z.union([
  z.literal('manual'),
  z.literal('scraper'),
  z.literal('referral'),
])
export type InfluencerSource = z.infer<typeof influencerSourceSchema>

// 联系人渠道：对齐 contact_channels 字典（email / line / whatsapp / instagram / facebook）
const contactChannelSchema = z.union([
  z.literal('email'),
  z.literal('line'),
  z.literal('whatsapp'),
  z.literal('instagram'),
  z.literal('facebook'),
])
export type ContactChannel = z.infer<typeof contactChannelSchema>

// 达人联系人：对齐 influencer_contacts 一对多结构
const influencerContactSchema = z.object({
  id: z.string(),
  channelId: contactChannelSchema,
  // 联系方式原始值：邮箱地址 / Line ID / WhatsApp 号码 / 社媒账号
  value: z.string(),
  // 是否主联系方式（同一达人仅一条为 true）
  isPrimary: z.boolean(),
  // 联系人备注：本人 / 经纪人 / MCN 对接人
  remark: z.string().optional(),
})
export type InfluencerContact = z.infer<typeof influencerContactSchema>

export const influencerSchema = z.object({
  id: z.string(),
  // 所属平台（platforms.id，业务代码，如 tiktok / instagram）
  platformId: z.string(),
  // 平台内唯一 ID，达人跨同步、导入、去重的稳定身份
  platformUid: z.string(),
  // 平台公开 handle，可能被达人修改
  handle: z.string().optional(),
  // 列表与详情主要展示名称
  displayName: z.string(),
  // 头像 URL
  avatarUrl: z.string().optional(),
  // 所属国家/地区（countries.id）
  countryId: z.number(),
  // 冗余国家名称，方便列表直接展示（后端 join 得到）
  countryName: z.string(),
  status: influencerStatusSchema,
  source: influencerSourceSchema.optional(),
  // 最新粉丝数快照
  followerCountSnapshot: z.number().nullable(),
  // 运营备注
  remark: z.string().optional(),
  // 联系人列表
  contacts: z.array(influencerContactSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Influencer = z.infer<typeof influencerSchema>
