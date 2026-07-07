import { type ProductStatus } from './schema'

// ---------------------------------------------------------------------------
// 上下架状态字典 + 徽标样式（对齐 status tinyint 1/0）
// ---------------------------------------------------------------------------
export const productStatuses: { value: ProductStatus; label: string }[] = [
  { value: 1, label: '上架' },
  { value: 0, label: '下架' },
]

export const productStatusStyles = new Map<ProductStatus, string>([
  [1, 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [0, 'bg-neutral-300/40 border-neutral-300'],
])

// ---------------------------------------------------------------------------
// 团队字典（模拟 teams 表；品牌归属团队，是产品模块的权限入口）
// ---------------------------------------------------------------------------
export const teams: { value: number; label: string }[] = [
  { value: 1, label: '欧美运营组' },
  { value: 2, label: '东南亚运营组' },
  { value: 3, label: '拉美运营组' },
]

export function teamLabel(id: number) {
  return teams.find((t) => t.value === id)?.label ?? '未知团队'
}
