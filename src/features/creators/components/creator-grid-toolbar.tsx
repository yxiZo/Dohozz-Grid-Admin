import { type ReactNode } from 'react'
import { Download, KanbanSquare, Plus, Table2, Trash2 } from 'lucide-react'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type CreatorView = 'table' | 'kanban'

export type CreatorGridToolbarProps = {
  rowCount: number
  view: CreatorView
  onViewChange: (view: CreatorView) => void
  onAdd: () => void
  onDeleteSelected: () => void
  onExport: () => void
  /** Compact filter control rendered inline in the toolbar. */
  filterSlot?: ReactNode
}

export function CreatorGridToolbar({
  rowCount,
  view,
  onViewChange,
  onAdd,
  onDeleteSelected,
  onExport,
  filterSlot,
}: CreatorGridToolbarProps) {
  const { t } = useLanguage()

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Tabs
        value={view}
        onValueChange={(v) => onViewChange(v as CreatorView)}
      >
        <TabsList>
          <TabsTrigger value='table'>
            <Table2 data-icon='inline-start' />
            表格
          </TabsTrigger>
          <TabsTrigger value='kanban'>
            <KanbanSquare data-icon='inline-start' />
            看板
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filterSlot}

      <Button size='sm' onClick={onAdd}>
        <Plus data-icon='inline-start' />
        {t('creators.addRow')}
      </Button>
      {view === 'table' && (
        <>
          <Button size='sm' variant='outline' onClick={onDeleteSelected}>
            <Trash2 data-icon='inline-start' />
            {t('creators.deleteRow')}
          </Button>
          <Button size='sm' variant='outline' onClick={onExport}>
            <Download data-icon='inline-start' />
            {t('creators.export')}
          </Button>
        </>
      )}
      <p className='ms-auto text-sm text-muted-foreground'>
        {t('creators.rowCount', { count: rowCount })}
      </p>
    </div>
  )
}
