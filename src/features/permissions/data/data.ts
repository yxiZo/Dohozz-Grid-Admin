import {
  LayoutDashboard,
  Table2,
  Megaphone,
  Users,
  Shield,
  KeyRound,
  type LucideIcon,
} from 'lucide-react'
import { type PermissionType } from './schema'

// 权限类型对应的徽标样式
export const permissionTypeStyles = new Map<PermissionType, string>([
  [
    'menu',
    'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300',
  ],
  [
    'action',
    'bg-teal-100/40 text-teal-900 dark:text-teal-200 border-teal-200',
  ],
])

export const permissionTypes = [
  { label: '菜单权限', value: 'menu' },
  { label: '操作权限', value: 'action' },
] as const

// 各业务模块的展示信息（图标 + 中文名）
export const moduleMeta: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  dashboard: { label: '仪表盘', icon: LayoutDashboard },
  leads: { label: '客户/线索', icon: Table2 },
  creator: { label: '达人运营', icon: Megaphone },
  user: { label: '用户管理', icon: Users },
  role: { label: '角色管理', icon: Shield },
  permission: { label: '权限管理', icon: KeyRound },
}

export const modules = Object.entries(moduleMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}))
