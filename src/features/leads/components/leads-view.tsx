import { useState } from 'react'
import { LayoutGrid, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import { type Lead } from '../data/data'
import { LeadsGrid } from './leads-grid'
import { LeadsKanban } from './leads-kanban'

type View = 'table' | 'kanban'

type LeadsViewProps = {
  initialData: Lead[]
}

export function LeadsView({ initialData }: LeadsViewProps) {
  const { t } = useLanguage()
  const [view, setView] = useState<View>('table')
  const [rows, setRows] = useState<Lead[]>(initialData)

  return (
    <div className='flex flex-1 flex-col gap-3'>
      <div className='bg-muted text-muted-foreground inline-flex w-fit items-center rounded-lg p-0.5'>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => setView('table')}
          className={cn(
            'h-8 gap-1.5',
            view === 'table' && 'bg-background text-foreground shadow-sm'
          )}
        >
          <Table2 className='size-4' />
          {t('leads.viewTable')}
        </Button>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => setView('kanban')}
          className={cn(
            'h-8 gap-1.5',
            view === 'kanban' && 'bg-background text-foreground shadow-sm'
          )}
        >
          <LayoutGrid className='size-4' />
          {t('leads.viewKanban')}
        </Button>
      </div>

      {view === 'table' ? (
        <LeadsGrid rows={rows} setRows={setRows} />
      ) : (
        <LeadsKanban rows={rows} setRows={setRows} />
      )}
    </div>
  )
}
