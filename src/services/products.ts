import { api, type ApiResponse } from '@/lib/api'
import type {
  Brand,
  Product,
  ProductAttr,
  ProductRow,
  ProductSeries,
} from '@/features/products/data/schema'

export type ProductAttrPayload = Omit<ProductAttr, 'id'> & { id?: string }

export type ProductPayload = {
  sku: string
  productName?: string
  brandId: number
  seriesId: number
  status: Product['status']
  attrs: ProductAttrPayload[]
}

export async function getProducts() {
  const res = await api.get<ApiResponse<ProductRow[]>>('/products')
  return res.data.data
}

export async function getBrands() {
  const res = await api.get<ApiResponse<Brand[]>>('/brands')
  return res.data.data
}

export async function getProductSeries() {
  const res = await api.get<ApiResponse<ProductSeries[]>>('/product-series')
  return res.data.data
}

export async function createProduct(payload: ProductPayload) {
  const res = await api.post<ApiResponse<ProductRow>>('/products', payload)
  return res.data.data
}

export async function updateProduct(id: number, payload: ProductPayload) {
  const res = await api.put<ApiResponse<ProductRow>>(`/products/${id}`, payload)
  return res.data.data
}

export async function deleteProduct(id: number) {
  const res = await api.delete<ApiResponse<ProductRow>>(`/products/${id}`)
  return res.data.data
}
