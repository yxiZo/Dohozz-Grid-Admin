import { permissionHandlers } from './permissions'
import { roleHandlers } from './roles'
import { taskHandlers } from './tasks'
import { userHandlers } from './users'

export const handlers = [
  ...userHandlers,
  ...taskHandlers,
  ...roleHandlers,
  ...permissionHandlers,
]

