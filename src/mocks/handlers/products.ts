import { http, HttpResponse } from 'msw'
import type {
  Product,
  ProductAttr,
  ProductRow,
  ProductStatus,
} from '@/features/products/data/schema'
import { teamLabel } from '@/features/products/data/data'
import { mockBrands, mockProducts, mockProductSeries } from '../db/products'

type AttrBody = Omit<ProductAttr, 'id'> & { id?: string }

type ProductBody = {
  sku: string
  productName?: string
  seriesId: number
  brandId: number
  status: ProductStatus
  attrs: AttrBody[]
}

// 组装列表行：join 品牌 / 系列 / 团队冗余字段
function toRow(product: Product): ProductRow {
  const brand = mockBrands.find((b) => b.id === product.brandId)
  const series = mockProductSeries.find((s) => s.id === product.seriesId)
  return {
    ...product,
    brandName: brand?.brandName ?? '未知品牌',
    brandCode: brand?.brandCode ?? '-',
    seriesName: series?.seriesName ?? '未分组',
    seriesCode: series?.seriesCode ?? '-',
    teamName: teamLabel(product.teamId),
  }
}

function normalizeAttrs(attrs: AttrBody[]): ProductAttr[] {
  return attrs
    .filter((a) => a.key.trim() !== '')
    .map((a) => ({
      id: a.id ?? crypto.randomUUID(),
      key: a.key.trim(),
      value: a.value.trim(),
    }))
}

export const productHandlers = [
  http.get('/api/products', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockProducts.map(toRow),
    })
  }),

  http.get('/api/brands', () => {
    return HttpResponse.json({ code: 0, message: 'success', data: mockBrands })
  }),

  http.get('/api/product-series', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockProductSeries,
    })
  }),

  http.post('/api/products', async ({ request }) => {
    const body = (await request.json()) as ProductBody
    const brand = mockBrands.find((b) => b.id === body.brandId)
    if (!brand) {
      return HttpResponse.json(
        { code: 400, message: '品牌不存在', data: null },
        { status: 400 }
      )
    }
    // 唯一约束：同一品牌下 SKU 唯一
    const duplicate = mockProducts.find(
      (p) => p.brandId === body.brandId && p.sku === body.sku
    )
    if (duplicate) {
      return HttpResponse.json(
        { code: 400, message: '该品牌下已存在相同 SKU', data: null },
        { status: 400 }
      )
    }
    const now = new Date()
    const product: Product = {
      id: Math.max(0, ...mockProducts.map((p) => p.id)) + 1,
      sku: body.sku,
      productName: body.productName,
      seriesId: body.seriesId,
      brandId: body.brandId,
      teamId: brand.teamId, // 冗余品牌 team_id
      attrs: normalizeAttrs(body.attrs),
      status: body.status,
      companyId: brand.companyId,
      createdAt: now,
      updatedAt: now,
    }
    mockProducts.unshift(product)
    return HttpResponse.json({ code: 0, message: 'success', data: toRow(product) })
  }),

  http.put('/api/products/:id', async ({ params, request }) => {
    const body = (await request.json()) as ProductBody
    const product = mockProducts.find((p) => p.id === Number(params.id))
    if (!product) {
      return HttpResponse.json(
        { code: 404, message: '产品不存在', data: null },
        { status: 404 }
      )
    }
    const brand = mockBrands.find((b) => b.id === body.brandId)
    if (!brand) {
      return HttpResponse.json(
        { code: 400, message: '品牌不存在', data: null },
        { status: 400 }
      )
    }
    product.sku = body.sku
    product.productName = body.productName
    product.seriesId = body.seriesId
    product.brandId = body.brandId
    product.teamId = brand.teamId
    product.attrs = normalizeAttrs(body.attrs)
    product.status = body.status
    product.updatedAt = new Date()
    return HttpResponse.json({ code: 0, message: 'success', data: toRow(product) })
  }),

  http.delete('/api/products/:id', ({ params }) => {
    const index = mockProducts.findIndex((p) => p.id === Number(params.id))
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: '产品不存在', data: null },
        { status: 404 }
      )
    }
    // 软删除：从内存列表移除以模拟 deleted_at 生效
    const [removed] = mockProducts.splice(index, 1)
    return HttpResponse.json({ code: 0, message: 'success', data: toRow(removed) })
  }),
]
