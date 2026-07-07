import { Mail, MessageCircle, Phone, AtSign, MessageSquare } from 'lucide-react'
import { type Platform } from '@/assets/brand-icons/platform-logo'
import {
  type ContactChannel,
  type InfluencerSource,
  type InfluencerStatus,
} from './schema'

// ---------------------------------------------------------------------------
// 平台字典（对齐 platforms 查找表）。platformId 直接复用 PlatformLogo 支持的品牌，
// 以便列表展示官方品牌标识。新增平台只需在此追加一行。
// ---------------------------------------------------------------------------
export const platforms: { value: Platform; label: string }[] = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'shopee', label: 'Shopee' },
]

// ---------------------------------------------------------------------------
// 达人状态字典 + 徽标样式
// ---------------------------------------------------------------------------
export const influencerStatuses: { value: InfluencerStatus; label: string }[] = [
  { value: 'active', label: '合作中' },
  { value: 'inactive', label: '未激活' },
  { value: 'blacklisted', label: '黑名单' },
]

export const influencerStatusStyles = new Map<InfluencerStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  [
    'blacklisted',
    'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200',
  ],
])

// ---------------------------------------------------------------------------
// 达人来源字典
// ---------------------------------------------------------------------------
export const influencerSources: { value: InfluencerSource; label: string }[] = [
  { value: 'manual', label: '手动录入' },
  { value: 'scraper', label: '采集抓取' },
  { value: 'referral', label: '推荐引荐' },
]

// ---------------------------------------------------------------------------
// 联系人渠道字典（对齐 contact_channels 查找表）
// ---------------------------------------------------------------------------
export const contactChannels: {
  value: ContactChannel
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'line', label: 'Line', icon: MessageCircle },
  { value: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { value: 'instagram', label: 'Instagram', icon: AtSign },
  { value: 'facebook', label: 'Facebook', icon: MessageSquare },
]

// ---------------------------------------------------------------------------
// 国家/地区字典（模拟 countries 表，跨境达人常见市场）
// ---------------------------------------------------------------------------
export const countries: { value: number; label: string }[] = [
  { value: 1, label: '美国' },
  { value: 2, label: '英国' },
  { value: 3, label: '印度尼西亚' },
  { value: 4, label: '泰国' },
  { value: 5, label: '越南' },
  { value: 6, label: '马来西亚' },
  { value: 7, label: '菲律宾' },
  { value: 8, label: '巴西' },
]

export function countryLabel(id: number) {
  return countries.find((c) => c.value === id)?.label ?? '未知'
}

// 粉丝数展示：1.2万 / 3.4M 风格的紧凑格式
export function formatFollowers(value: number | null): string {
  if (value == null) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}
