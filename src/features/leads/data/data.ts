export type Lead = {
  id: string
  name: string
  company: string
  platform: string
  channel: string
  status: string
  owner: string
  amount: number
  followUpDate: string // ISO date string yyyy-mm-dd
  note: string
}

export const platformOptions = [
  '抖音',
  '微信',
  '淘宝',
  '小红书',
  '官网',
  '百度',
] as const

export const channelOptions = [
  '电话',
  '微信',
  '邮件',
  'QQ',
  '短信',
] as const

export const statusOptions = [
  '新线索',
  '跟进中',
  '已报价',
  '已成交',
  '已流失',
] as const

// Map status -> a tailwind/theme-friendly color token used for the status pill
export const statusColorMap: Record<string, string> = {
  新线索: 'var(--chart-1)',
  跟进中: 'var(--chart-2)',
  已报价: 'var(--chart-4)',
  已成交: 'var(--chart-3)',
  已流失: 'var(--destructive)',
}

function makeId(i: number) {
  return `L-${String(i + 1).padStart(4, '0')}`
}

const names = [
  '张伟',
  '李娜',
  '王芳',
  '刘洋',
  '陈静',
  '杨杰',
  '赵磊',
  '黄敏',
  '周涛',
  '吴霞',
  '徐强',
  '孙丽',
]
const companies = [
  '宏远科技',
  '蓝海传媒',
  '星辰电子',
  '云图网络',
  '锐捷智能',
  '天合实业',
  '恒信贸易',
  '极光软件',
]
const owners = ['销售一组', '销售二组', '王经理', '李经理', '张主管']

export const leads: Lead[] = Array.from({ length: 24 }).map((_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + (i % 12) - 4)
  return {
    id: makeId(i),
    name: names[i % names.length],
    company: companies[i % companies.length],
    platform: platformOptions[i % platformOptions.length],
    channel: channelOptions[i % channelOptions.length],
    status: statusOptions[i % statusOptions.length],
    owner: owners[i % owners.length],
    amount: Math.round((Math.random() * 90000 + 5000) / 100) * 100,
    followUpDate: d.toISOString().slice(0, 10),
    note: i % 3 === 0 ? '已发送产品资料，等待客户反馈' : '',
  }
})
