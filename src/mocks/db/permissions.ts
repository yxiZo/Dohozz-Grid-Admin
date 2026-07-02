import { faker } from '@faker-js/faker'
import type { Permission } from '@/features/permissions/data/schema'

faker.seed(20240607)

type ModuleDef = {
  module: string
  moduleName: string
  items: { code: string; name: string; type: 'menu' | 'action'; description?: string }[]
}

// 按菜单/资源分组的权限点目录
const catalog: ModuleDef[] = [
  {
    module: 'dashboard',
    moduleName: '仪表盘',
    items: [
      { code: 'dashboard:view', name: '访问仪表盘', type: 'menu', description: '查看仪表盘菜单' },
      { code: 'dashboard:stats', name: '查看统计数据', type: 'action', description: '查看仪表盘统计概览' },
    ],
  },
  {
    module: 'creator',
    moduleName: '达人运营',
    items: [
      { code: 'creator:view', name: '访问达人运营', type: 'menu', description: '查看达人运营菜单' },
      { code: 'creator:outreach', name: '建联提报', type: 'action' },
      { code: 'creator:sample', name: '寄样管理', type: 'action' },
      { code: 'creator:video', name: '视频验收', type: 'action' },
    ],
  },
  {
    module: 'user',
    moduleName: '用户管理',
    items: [
      { code: 'user:view', name: '查看用户', type: 'menu', description: '访问用户管理菜单' },
      { code: 'user:create', name: '新增用户', type: 'action' },
      { code: 'user:edit', name: '编辑用户', type: 'action' },
      { code: 'user:delete', name: '删除用户', type: 'action' },
      { code: 'user:assign-role', name: '分配角色', type: 'action', description: '为用户分配角色' },
    ],
  },
  {
    module: 'role',
    moduleName: '角色管理',
    items: [
      { code: 'role:view', name: '查看角色', type: 'menu', description: '访问角色管理菜单' },
      { code: 'role:create', name: '新增角色', type: 'action' },
      { code: 'role:edit', name: '编辑角色', type: 'action' },
      { code: 'role:delete', name: '删除角色', type: 'action' },
      { code: 'role:assign-permission', name: '分配权限', type: 'action', description: '为角色分配权限点' },
    ],
  },
  {
    module: 'permission',
    moduleName: '权限管理',
    items: [
      { code: 'permission:view', name: '查看权限', type: 'menu', description: '访问权限管理菜单' },
      { code: 'permission:create', name: '新增权限', type: 'action' },
      { code: 'permission:edit', name: '编辑权限', type: 'action' },
      { code: 'permission:delete', name: '删除权限', type: 'action' },
    ],
  },
]

export const mockPermissions: Permission[] = catalog.flatMap((group) =>
  group.items.map((item) => ({
    id: item.code,
    name: item.name,
    code: item.code,
    module: group.module,
    moduleName: group.moduleName,
    type: item.type,
    description: item.description,
    createdAt: faker.date.past({ years: 1 }),
  }))
)

// 所有权限点 id，供“超级管理员”角色默认全选
export const allPermissionIds = mockPermissions.map((p) => p.id)
