import { z } from 'zod'

const roleStatusSchema = z.union([z.literal('enabled'), z.literal('disabled')])
export type RoleStatus = z.infer<typeof roleStatusSchema>

const roleSchema = z.object({
  id: z.string(),
  // 角色名称，例如“运营主管”
  name: z.string(),
  // 角色编码，例如 operations_manager
  code: z.string(),
  description: z.string(),
  status: roleStatusSchema,
  // 该角色拥有的权限点 id 列表
  permissions: z.array(z.string()),
  // 关联用户数（mock 展示用）
  userCount: z.number(),
  // 系统内置角色不可删除
  isSystem: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Role = z.infer<typeof roleSchema>
