import { Download, Plus, Trash2 } from 'lucide-react'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'

export type CreatorGridToolbarProps = {
  rowCount: number
  onAdd: () => void
  onDeleteSelected: () => void
  onExport: () => void
}

export function CreatorGridToolbar({
  rowCount,
  onAdd,
  onDeleteSelected,
  onExport,
}: CreatorGridToolbarProps) {
  const { t } = useLanguage()

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button size='sm' onClick={onAdd}>
        <Plus data-icon='inline-start' />
        {t('creators.addRow')}
      </Button>
      <Button size='sm' variant='outline' onClick={onDeleteSelected}>
        <Trash2 data-icon='inline-start' />
        {t('creators.deleteRow')}
      </Button>
      <Button size='sm' variant='outline' onClick={onExport}>
        <Download data-icon='inline-start' />
        {t('creators.export')}
      </Button>
      <p className='ms-auto text-sm text-muted-foreground'>
        {t('creators.rowCount', { count: rowCount })}
      </p>
    </div>
  )
}
