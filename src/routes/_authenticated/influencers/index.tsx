import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Influencers } from '@/features/influencers'

const influencersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(''),
  platform: z.array(z.string()).optional().catch([]),
  country: z.array(z.string()).optional().catch([]),
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('blacklisted'),
      ])
    )
    .optional()
    .catch([]),
  source: z
    .array(
      z.union([
        z.literal('manual'),
        z.literal('scraper'),
        z.literal('referral'),
      ])
    )
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/influencers/')({
  validateSearch: influencersSearchSchema,
  component: Influencers,
})
