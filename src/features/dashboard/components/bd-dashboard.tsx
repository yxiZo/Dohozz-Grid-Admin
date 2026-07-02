import { ChevronRight } from 'lucide-react'
import { type Language } from '@/context/language-provider'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useDashboardDict } from '../data/i18n'
import {
  formatKpiValue,
  getBdFunnel,
  getBdKpis,
  getBdTargets,
  getBdTasks,
  getBdTopCreators,
  getBdTrend,
  type TimePeriod,
} from '../data/metrics'
import { FunnelChart, TrendChart } from './dashboard-charts'
import { KpiCard } from './kpi-card'

const toneClass = {
  default: 'bg-muted text-foreground',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  danger: 'bg-destructive/15 text-destructive',
} as const

type Props = {
  bd: string
  period: TimePeriod
  language: Language
}

export function BdDashboard({ bd, period, language }: Props) {
  const d = useDashboardDict(language)
  const kpis = getBdKpis(bd, period)
  const funnel = getBdFunnel(bd, period)
  const tasks = getBdTasks(bd)
  const creators = getBdTopCreators(bd)
  const targets = getBdTargets(bd, period)
  const trend = getBdTrend(bd, period, language)

  return (
    <div className='space-y-4'>
      {/* KPI row */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            kpi={kpi}
            label={language === 'zh' ? kpi.labelZh : kpi.labelEn}
            hint={language === 'zh' ? kpi.hintZh : kpi.hintEn}
            deltaSuffix={d('vsLast')}
          />
        ))}
      </div>

      {/* Trend + funnel */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle>{d('myTrend')}</CardTitle>
            <CardDescription>{d('myTrendDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <TrendChart data={trend} gmvLabel={d('gmv')} />
          </CardContent>
        </Card>
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>{d('funnel')}</CardTitle>
            <CardDescription>{d('funnelDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart stages={funnel} conversionLabel={d('conversion')} />
          </CardContent>
        </Card>
      </div>

      {/* Tasks + creators + targets */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>{d('tasks')}</CardTitle>
            <CardDescription>{d('tasksDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {tasks.map((task) => (
              <button
                key={task.key}
                className='flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-start transition-colors hover:bg-accent'
              >
                <span className='text-sm font-medium'>
                  {language === 'zh' ? task.labelZh : task.labelEn}
                </span>
                <span className='flex items-center gap-2'>
                  <span
                    className={cn(
                      'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
                      toneClass[task.tone]
                    )}
                  >
                    {task.count}
                  </span>
                  <ChevronRight className='h-4 w-4 text-muted-foreground' />
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className='lg:col-span-3'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <div>
              <CardTitle>{d('myCreators')}</CardTitle>
              <CardDescription>{d('myCreatorsDesc')}</CardDescription>
            </div>
            <Button variant='ghost' size='sm' className='text-xs'>
              {d('viewAll')}
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {creators.map((c) => (
              <div key={c.id} className='flex items-center gap-3'>
                <Avatar className='h-9 w-9'>
                  <AvatarFallback className='text-xs'>
                    {c.handle.replace('@', '').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{c.handle}</p>
                  <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <Badge variant='outline' className='px-1 py-0 text-[10px]'>
                      {c.country}
                    </Badge>
                    {c.category}
                  </p>
                </div>
                <div className='text-end'>
                  <p className='text-sm font-semibold tabular-nums'>
                    ${c.gmv.toLocaleString('en-US')}
                  </p>
                  <p className='text-xs text-muted-foreground'>{c.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>{d('targets')}</CardTitle>
            <CardDescription>{d('targetsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6 pt-2'>
            {targets.map((tg) => {
              const pct = Math.min(
                100,
                Math.round((tg.current / tg.target) * 100)
              )
              return (
                <div key={tg.labelEn} className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='font-medium'>
                      {language === 'zh' ? tg.labelZh : tg.labelEn}
                    </span>
                    <span className='text-muted-foreground tabular-nums'>
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} />
                  <div className='flex justify-between text-xs text-muted-foreground tabular-nums'>
                    <span>{formatKpiValue(tg.current, tg.format)}</span>
                    <span>{formatKpiValue(tg.target, tg.format)}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
