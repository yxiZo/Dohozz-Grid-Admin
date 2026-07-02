import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Roles } from '@/features/roles'

const rolesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.union([z.literal('enabled'), z.literal('disabled')]))
    .optional()
    .catch([]),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/system/roles/')({
  validateSearch: rolesSearchSchema,
  component: Roles,
})
