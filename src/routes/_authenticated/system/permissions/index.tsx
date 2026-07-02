import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Permissions } from '@/features/permissions'

const permissionsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  module: z.array(z.string()).optional().catch([]),
  type: z
    .array(z.union([z.literal('menu'), z.literal('action')]))
    .optional()
    .catch([]),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/system/permissions/')({
  validateSearch: permissionsSearchSchema,
  component: Permissions,
})
