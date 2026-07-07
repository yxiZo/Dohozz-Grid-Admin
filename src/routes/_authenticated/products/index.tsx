import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Products } from '@/features/products'

const productsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  sku: z.string().optional().catch(''),
  brand: z.array(z.string()).optional().catch([]),
  team: z.array(z.string()).optional().catch([]),
  status: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/products/')({
  validateSearch: productsSearchSchema,
  component: Products,
})
