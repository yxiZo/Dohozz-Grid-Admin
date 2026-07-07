import { faker } from '@faker-js/faker'
import type {
  ContactChannel,
  Influencer,
  InfluencerContact,
  InfluencerSource,
  InfluencerStatus,
} from '@/features/influencers/data/schema'

faker.seed(24680)

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'facebook', 'shopee']

const STATUS_WEIGHTS: { value: InfluencerStatus; weight: number }[] = [
  { value: 'active', weight: 62 },
  { value: 'inactive', weight: 28 },
  { value: 'blacklisted', weight: 10 },
]

const SOURCE_WEIGHTS: { value: InfluencerSource; weight: number }[] = [
  { value: 'manual', weight: 45 },
  { value: 'scraper', weight: 40 },
  { value: 'referral', weight: 15 },
]

const COUNTRIES = [
  { id: 1, name: '美国' },
  { id: 2, name: '英国' },
  { id: 3, name: '印度尼西亚' },
  { id: 4, name: '泰国' },
  { id: 5, name: '越南' },
  { id: 6, name: '马来西亚' },
  { id: 7, name: '菲律宾' },
  { id: 8, name: '巴西' },
]

const CHANNELS: ContactChannel[] = [
  'email',
  'line',
  'whatsapp',
  'instagram',
  'facebook',
]

function weightedPick<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0)
  let r = faker.number.float({ min: 0, max: total })
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item.value
  }
  return items[items.length - 1].value
}

function buildContacts(handle: string): InfluencerContact[] {
  const count = faker.number.int({ min: 1, max: 3 })
  const pickedChannels = faker.helpers.arrayElements(CHANNELS, count)
  return pickedChannels.map((channelId, index) => {
    const value =
      channelId === 'email'
        ? faker.internet.email().toLowerCase()
        : channelId === 'whatsapp'
          ? `+${faker.string.numeric(11)}`
          : channelId === 'line'
            ? `${handle}_line`
            : `@${handle}`
    return {
      id: faker.string.uuid(),
      channelId,
      value,
      isPrimary: index === 0,
      remark: faker.helpers.arrayElement(['本人', '经纪人', 'MCN 对接人', '']),
    }
  })
}

export const mockInfluencers: Influencer[] = Array.from(
  { length: 120 },
  () => {
    const platformId = faker.helpers.arrayElement(PLATFORMS)
    const country = faker.helpers.arrayElement(COUNTRIES)
    const handle = faker.internet
      .username()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
    const displayName = faker.person.fullName()
    const status = weightedPick(STATUS_WEIGHTS)

    return {
      id: faker.string.uuid(),
      platformId,
      platformUid: faker.string.numeric(12),
      handle,
      displayName,
      avatarUrl: faker.image.avatarGitHub(),
      countryId: country.id,
      countryName: country.name,
      status,
      source: weightedPick(SOURCE_WEIGHTS),
      followerCountSnapshot: faker.number.int({ min: 1_200, max: 8_500_000 }),
      remark: faker.helpers.arrayElement([
        '带货转化稳定，可长期合作',
        '响应较慢，需提前沟通',
        '母婴品类头部达人',
        '',
        '价格偏高，适合大促',
      ]),
      contacts: buildContacts(handle),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
    }
  }
)
