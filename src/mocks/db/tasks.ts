import { faker } from '@faker-js/faker'
import type { Task } from '@/features/tasks/data/schema'

faker.seed(12345)

export const mockTasks: Task[] = Array.from({ length: 100 }, () => {
  const statuses = ['todo', 'in progress', 'done', 'canceled', 'backlog'] as const
  const labels = ['bug', 'feature', 'documentation'] as const
  const priorities = ['low', 'medium', 'high'] as const

  return {
    id: `TASK-${faker.number.int({ min: 1000, max: 9999 })}`,
    title: faker.lorem.sentence({ min: 5, max: 15 }),
    status: faker.helpers.arrayElement(statuses),
    label: faker.helpers.arrayElement(labels),
    priority: faker.helpers.arrayElement(priorities),
  }
})

