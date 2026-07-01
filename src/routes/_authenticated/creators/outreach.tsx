import { createFileRoute } from '@tanstack/react-router'
import { Creators } from '@/features/creators'

export const Route = createFileRoute('/_authenticated/creators/outreach')({
  component: () => <Creators stage='outreach' />,
})
