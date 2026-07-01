import { createFileRoute } from '@tanstack/react-router'
import { Creators } from '@/features/creators'

export const Route = createFileRoute('/_authenticated/creators/samples')({
  component: () => <Creators stage='samples' />,
})
