import { type RoleStatus } from './schema'

// 角色状态徽标样式
export const roleStatusStyles = new Map<RoleStatus, string>([
  [
    'enabled',
    'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  ],
  ['disabled', 'bg-neutral-300/40 border-neutral-300'],
])

export const roleStatuses = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
] as const
