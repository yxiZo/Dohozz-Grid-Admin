import { faker } from '@faker-js/faker'
import type { User } from '@/features/users/data/schema'

faker.seed(67890)

// 中文姓名池（模拟真实运营团队成员）
const SURNAMES = [
  '王',
  '李',
  '张',
  '刘',
  '陈',
  '杨',
  '赵',
  '黄',
  '周',
  '吴',
  '徐',
  '孙',
  '胡',
  '朱',
  '高',
  '林',
  '何',
  '郭',
  '马',
  '罗',
]

const GIVEN_NAMES = [
  '伟',
  '芳',
  '娜',
  '敏',
  '静',
  '磊',
  '强',
  '军',
  '洋',
  '勇',
  '艳',
  '杰',
  '娟',
  '涛',
  '明',
  '超',
  '霞',
  '平',
  '刚',
  '桂英',
  '子涵',
  '雨萱',
  '浩然',
  '梓萱',
  '思远',
  '欣怡',
  '嘉琪',
  '晓峰',
  '雅婷',
  '文博',
]

// 拼音映射，用于生成账号与邮箱
const PINYIN: Record<string, string> = {
  王: 'wang',
  李: 'li',
  张: 'zhang',
  刘: 'liu',
  陈: 'chen',
  杨: 'yang',
  赵: 'zhao',
  黄: 'huang',
  周: 'zhou',
  吴: 'wu',
  徐: 'xu',
  孙: 'sun',
  胡: 'hu',
  朱: 'zhu',
  高: 'gao',
  林: 'lin',
  何: 'he',
  郭: 'guo',
  马: 'ma',
  罗: 'luo',
}

const ROLE_WEIGHTS: { value: User['role']; weight: number }[] = [
  { value: 'superadmin', weight: 2 },
  { value: 'admin', weight: 8 },
  { value: 'manager', weight: 25 },
  { value: 'cashier', weight: 65 },
]

const STATUS_WEIGHTS: { value: User['status']; weight: number }[] = [
  { value: 'active', weight: 70 },
  { value: 'invited', weight: 12 },
  { value: 'inactive', weight: 12 },
  { value: 'suspended', weight: 6 },
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

export const mockUsers: User[] = Array.from({ length: 500 }, (_, index) => {
  const surname = faker.helpers.arrayElement(SURNAMES)
  const given = faker.helpers.arrayElement(GIVEN_NAMES)
  const surnamePinyin = PINYIN[surname] ?? 'user'
  // username 用「姓拼音 + 序号」，保证唯一
  const username = `${surnamePinyin}${String(index + 1).padStart(3, '0')}`

  return {
    id: faker.string.uuid(),
    // 中文姓名：lastName 存姓，firstName 存名（表格里拼成「姓名」展示）
    firstName: given,
    lastName: surname,
    username,
    email: `${username}@dohozz.com`,
    phoneNumber: `+86 1${faker.helpers.arrayElement(['3', '5', '7', '8', '9'])}${faker.string.numeric(9)}`,
    status: weightedPick(STATUS_WEIGHTS),
    role: weightedPick(ROLE_WEIGHTS),
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 }),
  }
})
