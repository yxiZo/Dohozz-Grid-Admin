'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getPermissions } from '@/services/permissions'
import { updateRolePermissions } from '@/services/roles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { moduleMeta } from '@/features/permissions/data/data'
import { groupPermissions } from '@/features/permissions/data/schema'
import { type Role } from '../data/schema'

type Props = {
  currentRow: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesPermissionsDialog({
  currentRow,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (ids: string[]) => updateRolePermissions(currentRow.id, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(`已保存「${currentRow.name}」的权限。`)
      onOpenChange(false)
    },
    onError: () => toast.error('保存失败，请稍后重试。'),
  })

  const groups = useMemo(() => groupPermissions(permissions), [permissions])
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(currentRow.permissions)
  )

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const toggleGroup = (ids: string[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
      return next
    })
  }

  const allIds = permissions.map((p) => p.id)
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.has(id))
  const someChecked = allIds.some((id) => selected.has(id))

  const handleSave = () => mutate(Array.from(selected))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>分配权限 - {currentRow.name}</DialogTitle>
          <DialogDescription>
            勾选该角色可访问的菜单与操作权限。当前已选 {selected.size} 项。
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center justify-between rounded-md border px-3 py-2'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='select-all-permissions'
              checked={
                allChecked ? true : someChecked ? 'indeterminate' : false
              }
              onCheckedChange={(v) => toggleGroup(allIds, !!v)}
            />
            <label
              htmlFor='select-all-permissions'
              className='text-sm font-medium'
            >
              全选
            </label>
          </div>
          <span className='text-xs text-muted-foreground'>
            {selected.size} / {allIds.length}
          </span>
        </div>

        <ScrollArea className='h-96 pe-3'>
          <div className='flex flex-col gap-2'>
            {groups.map((group) => {
              const ids = group.permissions.map((p) => p.id)
              const groupAll = ids.every((id) => selected.has(id))
              const groupSome = ids.some((id) => selected.has(id))
              const Icon = moduleMeta[group.module]?.icon
              const selectedInGroup = ids.filter((id) =>
                selected.has(id)
              ).length

              return (
                <Collapsible
                  key={group.module}
                  defaultOpen
                  className='rounded-md border'
                >
                  <div className='flex items-center justify-between gap-2 px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        checked={
                          groupAll
                            ? true
                            : groupSome
                              ? 'indeterminate'
                              : false
                        }
                        onCheckedChange={(v) => toggleGroup(ids, !!v)}
                        aria-label={`选择${group.moduleName}全部权限`}
                      />
                      {Icon && (
                        <Icon size={16} className='text-muted-foreground' />
                      )}
                      <span className='text-sm font-medium'>
                        {group.moduleName}
                      </span>
                      <Badge variant='secondary' className='text-xs'>
                        {selectedInGroup}/{ids.length}
                      </Badge>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant='ghost' size='icon' className='size-7'>
                        <ChevronDown className='size-4 transition-transform data-[state=closed]:-rotate-90' />
                        <span className='sr-only'>展开/收起</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className='grid grid-cols-1 gap-2 border-t px-3 py-3 sm:grid-cols-2'>
                      {group.permissions.map((p) => (
                        <label
                          key={p.id}
                          className={cn(
                            'flex items-start gap-2 rounded-md p-1.5 hover:bg-muted'
                          )}
                        >
                          <Checkbox
                            checked={selected.has(p.id)}
                            onCheckedChange={(v) => toggleOne(p.id, !!v)}
                            className='mt-0.5'
                          />
                          <div className='flex flex-col'>
                            <span className='text-sm leading-tight'>
                              {p.name}
                            </span>
                            <code className='text-xs text-muted-foreground'>
                              {p.code}
                            </code>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
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
