import { z } from 'zod'

// 上下架状态：对齐 status tinyint（1 上架 / 0 下架）
const productStatusSchema = z.union([z.literal(1), z.literal(0)])
export type ProductStatus = z.infer<typeof productStatusSchema>

// ---------------------------------------------------------------------------
// 品牌：对齐 brands 表。一致性边界为品牌，品牌归属团队（team_id），
// 产品模块权限只用 team_id 匹配 employee_team_scopes，忽略 country_id。
// ---------------------------------------------------------------------------
export const brandSchema = z.object({
  id: z.number(),
  brandCode: z.string(),
  brandName: z.string(),
  teamId: z.number(),
  companyId: z.number(),
  status: productStatusSchema,
})
export type Brand = z.infer<typeof brandSchema>

// ---------------------------------------------------------------------------
// 产品系列：对齐 product_series 表。归属品牌（brand_id），
// 冗余 brands.team_id 以支撑产品列表高频范围过滤。
// ---------------------------------------------------------------------------
export const productSeriesSchema = z.object({
  id: z.number(),
  seriesCode: z.string(),
  seriesName: z.string().optional(),
  brandId: z.number(),
  teamId: z.number(),
  companyId: z.number(),
  status: productStatusSchema,
})
export type ProductSeries = z.infer<typeof productSeriesSchema>

// 产品扩展属性：对齐 products.ext（JSON）。以键值对承载不定结构的规格信息。
const productAttrSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
})
export type ProductAttr = z.infer<typeof productAttrSchema>

// ---------------------------------------------------------------------------
// 产品（SKU）：对齐 products 表。唯一约束 (brand_id, sku)。
// ---------------------------------------------------------------------------
export const productSchema = z.object({
  id: z.number(),
  // 品牌内唯一 SKU 编码
  sku: z.string(),
  productName: z.string().optional(),
  // 所属系列（product_series.id）
  seriesId: z.number(),
  // 所属品牌（brands.id），冗余以支撑唯一约束与过滤
  brandId: z.number(),
  // 冗余 brands.team_id
  teamId: z.number(),
  // 扩展属性（JSON ext），列表以键值对形式展示
  attrs: z.array(productAttrSchema),
  status: productStatusSchema,
  companyId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Product = z.infer<typeof productSchema>

// 列表行：后端 join 得到的冗余展示字段（品牌名 / 系列名 / 团队名）
export const productRowSchema = productSchema.extend({
  brandName: z.string(),
  brandCode: z.string(),
  seriesName: z.string(),
  seriesCode: z.string(),
  teamName: z.string(),
})
export type ProductRow = z.infer<typeof productRowSchema>
