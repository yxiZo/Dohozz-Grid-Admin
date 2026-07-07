import { influencerHandlers } from './influencers'
import { permissionHandlers } from './permissions'
import { productHandlers } from './products'
import { roleHandlers } from './roles'
import { taskHandlers } from './tasks'
import { teamHandlers } from './teams'
import { userHandlers } from './users'

export const handlers = [
  ...userHandlers,
  ...taskHandlers,
  ...roleHandlers,
  ...permissionHandlers,
  ...teamHandlers,
  ...influencerHandlers,
  ...productHandlers,
]

