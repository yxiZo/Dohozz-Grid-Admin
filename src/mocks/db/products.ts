import { faker } from '@faker-js/faker'
import type {
  Brand,
  Product,
  ProductAttr,
  ProductSeries,
  ProductStatus,
} from '@/features/products/data/schema'

faker.seed(13579)

// 团队池（对齐 features/products/data/data.ts 的 teams 字典）
const TEAM_IDS = [1, 2, 3]

// ---------------------------------------------------------------------------
// 品牌种子数据：一致性边界，归属团队
// ---------------------------------------------------------------------------
const BRAND_SEED: { code: string; name: string; teamId: number }[] = [
  { code: 'AURA', name: 'Aura 极光', teamId: 1 },
  { code: 'LUMO', name: 'Lumo 光屿', teamId: 1 },
  { code: 'NORS', name: 'Nordis 北屿', teamId: 1 },
  { code: 'BLOOM', name: 'Bloom 花漾', teamId: 2 },
  { code: 'ZEST', name: 'Zest 元气', teamId: 2 },
  { code: 'MOMO', name: 'Momo 沐沐', teamId: 2 },
  { code: 'VITA', name: 'Vita 维塔', teamId: 3 },
  { code: 'SOLA', name: 'Sola 索拉', teamId: 3 },
]

export const mockBrands: Brand[] = BRAND_SEED.map((b, i) => ({
  id: i + 1,
  brandCode: b.code,
  brandName: b.name,
  teamId: b.teamId,
  companyId: 1,
  status: (faker.number.int({ min: 0, max: 10 }) > 1 ? 1 : 0) as ProductStatus,
}))

// ---------------------------------------------------------------------------
// 产品系列种子数据：每个品牌 2-4 个系列，冗余品牌的 team_id
// ---------------------------------------------------------------------------
const SERIES_WORDS = [
  '经典',
  '轻享',
  '臻选',
  '星耀',
  '致美',
  '悦活',
  '焕新',
  '尊享',
]

let seriesAutoId = 1
export const mockProductSeries: ProductSeries[] = mockBrands.flatMap(
  (brand) => {
    const count = faker.number.int({ min: 2, max: 4 })
    return faker.helpers
      .arrayElements(SERIES_WORDS, count)
      .map((word, idx) => ({
        id: seriesAutoId++,
        seriesCode: `${brand.brandCode}-S${String(idx + 1).padStart(2, '0')}`,
        seriesName: `${word}系列`,
        brandId: brand.id,
        teamId: brand.teamId,
        companyId: 1,
        status: 1 as ProductStatus,
      }))
  }
)

// ---------------------------------------------------------------------------
// 产品（SKU）种子数据：随机挂载到系列上，ext 承载规格属性
// ---------------------------------------------------------------------------
const COLORS = ['珊瑚粉', '雾霾蓝', '象牙白', '碳晶黑', '薄荷绿', '暮光紫']
const SPECS = ['单支装', '双支装', '家庭装', '旅行便携装']
const VOLUMES = ['30ml', '50ml', '100ml', '150ml', '250ml']

function buildAttrs(): ProductAttr[] {
  const attrs: ProductAttr[] = [
    { id: faker.string.uuid(), key: '颜色', value: faker.helpers.arrayElement(COLORS) },
    { id: faker.string.uuid(), key: '规格', value: faker.helpers.arrayElement(SPECS) },
  ]
  if (faker.datatype.boolean()) {
    attrs.push({
      id: faker.string.uuid(),
      key: '净含量',
      value: faker.helpers.arrayElement(VOLUMES),
    })
  }
  return attrs
}

export const mockProducts: Product[] = Array.from({ length: 156 }, (_, i) => {
  const series = faker.helpers.arrayElement(mockProductSeries)
  const brand = mockBrands.find((b) => b.id === series.brandId)!
  const now = new Date()
  return {
    id: i + 1,
    sku: `${brand.brandCode}-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
    productName: `${brand.brandName} ${series.seriesName} ${faker.commerce.productName()}`,
    seriesId: series.id,
    brandId: brand.id,
    teamId: brand.teamId,
    attrs: buildAttrs(),
    status: (faker.number.int({ min: 0, max: 10 }) > 2 ? 1 : 0) as ProductStatus,
    companyId: 1,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 60, refDate: now }),
  }
})

// 保持团队引用被使用（避免 lint 未使用告警），同时校验种子数据合法
if (mockBrands.some((b) => !TEAM_IDS.includes(b.teamId))) {
  throw new Error('mock brand has invalid teamId')
}
