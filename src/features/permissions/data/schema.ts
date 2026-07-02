import { z } from 'zod'

const permissionTypeSchema = z.union([z.literal('menu'), z.literal('action')])
export type PermissionType = z.infer<typeof permissionTypeSchema>

const permissionSchema = z.object({
  id: z.string(),
  // 权限名称（中文），例如“查看用户”
  name: z.string(),
  // 权限编码，例如 user:view
  code: z.string(),
  // 所属模块/资源标识，例如 user
  module: z.string(),
  // 所属模块中文名，例如“用户管理”
  moduleName: z.string(),
  // menu = 菜单访问权限，action = 页面内操作权限
  type: permissionTypeSchema,
  description: z.string().optional(),
  createdAt: z.coerce.date(),
})
export type Permission = z.infer<typeof permissionSchema>

// 权限点按模块分组后的结构，用于角色分配权限的树形展示
export type PermissionGroup = {
  module: string
  moduleName: string
  permissions: Permission[]
}

export function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const map = new Map<string, PermissionGroup>()
  for (const p of permissions) {
    if (!map.has(p.module)) {
      map.set(p.module, {
        module: p.module,
        moduleName: p.moduleName,
        permissions: [],
      })
    }
    map.get(p.module)!.permissions.push(p)
  }
  return Array.from(map.values())
}
