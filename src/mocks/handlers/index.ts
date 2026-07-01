import { taskHandlers } from './tasks'
import { userHandlers } from './users'

export const handlers = [...userHandlers, ...taskHandlers]

