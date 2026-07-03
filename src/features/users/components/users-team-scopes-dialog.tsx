'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Info, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getEmployeeTeamScopes,
  getTeams,
  updateEmployeeTeamScopes,
} from '@/services/teams'
import type { EmployeeTeamScopeInput } from '@/features/teams/data/schema'
import {
  CountrySelect,
  TeamSelect,
} from '@/features/teams/components/team-country-select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type User } from '../data/schema'

type Props = {
  currentRow: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

// UI 内部使用的可编辑范围行
type ScopeRow = {
  key: string
  team_id: number | null
  country_id: number | null
  effective_start: string // YYYY-MM-DD 或 ''
  effective_end: string // YYYY-MM-DD 或 ''
}

// 角色拥有全量数据权限（data_permission = 1），无需配置团队范围。
const FULL_DATA_PERMISSION_ROLES = ['superadmin']

function isoToDateInput(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function dateInputToIso(date: string): string | null {
  if (!date) return null
  return new Date(`${date}T00:00:00.000Z`).toISOString()
}

function newKey() {
  return Math.random().toString(36).slice(2)
}

export function UsersTeamScopesDialog({ currentRow, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const employeeName = `${currentRow.firstName} ${currentRow.lastName}`.trim()
  const hasFullDataPermission = FULL_DATA_PERMISSION_ROLES.includes(
    currentRow.role
  )

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const { data: scopes = [], isLoading } = useQuery({
    queryKey: ['employee-team-scopes', currentRow.id],
    queryFn: () => getEmployeeTeamScopes(currentRow.id),
    enabled: open,
  })

  const [rows, setRows] = useState<ScopeRow[]>([])

  // 每次打开或数据变化时，用服务端返回的范围初始化编辑行。
  useEffect(() => {
    if (!open) return
    setRows(
      scopes.map((s) => ({
        key: newKey(),
        team_id: s.team_id,
        country_id: s.country_id,
        effective_start: isoToDateInput(s.effective_start),
        effective_end: isoToDateInput(s.effective_end),
      }))
    )
  }, [open, scopes])

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: EmployeeTeamScopeInput[]) =>
      updateEmployeeTeamScopes(currentRow.id, employeeName, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-team-scopes', currentRow.id],
      })
      toast.success(`已保存「${employeeName}」的数据范围。`)
      onOpenChange(false)
    },
    onError: () => toast.error('保存失败，请检查是否存在重复范围。'),
  })

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        key: newKey(),
        team_id: null,
        country_id: null,
        effective_start: '',
        effective_end: '',
      },
    ])
  }

  const updateRow = (key: string, patch: Partial<ScopeRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    )
  }

  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  const handleSave = () => {
    const incomplete = rows.some((r) => r.team_id == null)
    if (incomplete) {
      toast.error('请为每一行选择团队。')
      return
    }

    // 校验重复：同团队 + 同国家范围不能重复。
    const seen = new Set<string>()
    for (const r of rows) {
      const key = `${r.team_id}-${r.country_id ?? 'all'}`
      if (seen.has(key)) {
        toast.error('存在重复的团队/国家范围。')
        return
      }
      seen.add(key)
    }

    const payload: EmployeeTeamScopeInput[] = rows.map((r) => ({
      team_id: r.team_id as number,
      country_id: r.country_id,
      effective_start: dateInputToIso(r.effective_start),
      effective_end: dateInputToIso(r.effective_end),
    }))

    mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='gap-0 p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b p-6'>
          <DialogTitle>配置数据范围 - {employeeName}</DialogTitle>
          <DialogDescription>
            配置该员工能查看的业务团队与国家范围。国家选择「全部国家」表示该团队下所有国家。
          </DialogDescription>
        </DialogHeader>

        <div className='p-6'>
          {hasFullDataPermission && (
            <div className='mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-foreground'>
              <Info className='mt-0.5 size-4 shrink-0 text-primary' />
              <p>
                该员工拥有全量数据权限，可查看公司内所有业务数据，无需配置团队范围。
              </p>
            </div>
          )}

          {!hasFullDataPermission && (
            <p className='mb-4 text-sm text-muted-foreground'>
              普通员工必须配置团队范围，否则看不到受范围控制的数据。
            </p>
          )}

          <ScrollArea className='max-h-[52vh]'>
            <div className='flex flex-col gap-3 pe-3'>
              {/* 表头 */}
              <div className='hidden grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] items-center gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid'>
                <span>团队</span>
                <span>国家范围</span>
                <span>生效时间</span>
                <span>失效时间</span>
                <span className='sr-only'>操作</span>
              </div>

              {rows.length === 0 && (
                <div className='rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground'>
                  {isLoading ? '加载中...' : '暂无数据范围，点击下方「添加范围」新增。'}
                </div>
              )}

              {rows.map((row) => {
                const team = teams.find((t) => t.id === row.team_id) ?? null
                return (
                  <div
                    key={row.key}
                    className='grid grid-cols-1 items-end gap-2 rounded-md border p-3 sm:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] sm:items-center sm:border-0 sm:p-0'
                  >
                    <div className='flex flex-col gap-1.5'>
                      <Label className='text-xs text-muted-foreground sm:hidden'>
                        团队
                      </Label>
                      <TeamSelect
                        teams={teams}
                        value={row.team_id}
                        onChange={(teamId) =>
                          // 切换团队时重置国家，避免残留不属于新团队的国家
                          updateRow(row.key, {
                            team_id: teamId,
                            country_id: null,
                          })
                        }
                      />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                      <Label className='text-xs text-muted-foreground sm:hidden'>
                        国家范围
                      </Label>
                      <CountrySelect
                        team={team}
                        value={row.country_id}
                        allowAll
                        onChange={(countryId) =>
                          updateRow(row.key, { country_id: countryId })
                        }
                      />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                      <Label className='text-xs text-muted-foreground sm:hidden'>
                        生效时间
                      </Label>
                      <Input
                        type='date'
                        value={row.effective_start}
                        onChange={(e) =>
                          updateRow(row.key, {
                            effective_start: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                      <Label className='text-xs text-muted-foreground sm:hidden'>
                        失效时间
                      </Label>
                      <Input
                        type='date'
                        value={row.effective_end}
                        onChange={(e) =>
                          updateRow(row.key, { effective_end: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      variant='ghost'
                      size='icon'
                      className='justify-self-end text-destructive'
                      onClick={() => removeRow(row.key)}
                      aria-label='删除该范围'
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                )
              })}

              <Button
                variant='outline'
                size='sm'
                className='self-start'
                onClick={addRow}
              >
                <Plus data-icon='inline-start' />
                添加范围
              </Button>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className='border-t p-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
