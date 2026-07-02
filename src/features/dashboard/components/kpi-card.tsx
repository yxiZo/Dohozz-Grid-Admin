import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatKpiValue, type Kpi } from '../data/metrics'

type KpiCardProps = {
  kpi: Kpi
  label: string
  hint?: string
  deltaSuffix: string
}

export function KpiCard({ kpi, label, hint, deltaSuffix }: KpiCardProps) {
  const hasDelta = kpi.delta !== 0
  const positive = kpi.delta > 0

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {label}
        </CardTitle>
        {hasDelta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
              positive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {positive ? (
              <ArrowUpRight className='h-3 w-3' />
            ) : (
              <ArrowDownRight className='h-3 w-3' />
            )}
            {Math.abs(kpi.delta)}%
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold tracking-tight'>
          {formatKpiValue(kpi.value, kpi.format)}
        </div>
        <p className='mt-1 text-xs text-muted-foreground'>
          {hint ? hint : hasDelta ? `${deltaSuffix}` : ''}
        </p>
      </CardContent>
    </Card>
  )
}
