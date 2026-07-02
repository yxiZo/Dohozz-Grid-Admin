import { useMemo, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDashboardDict } from '../data/i18n'
import {
  brandOptions,
  formatKpiValue,
  getBdFunnel,
  getBdKpis,
  getBdPerformanceMetrics,
  getBdTargets,
  getBdTasks,
  getBdTopCreators,
  getBdTrend,
  seriesOptions,
  type BdFilters,
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
  const [series, setSeries] = useState('all')
  const [brand, setBrand] = useState('all')

  const allSeries = useMemo(() => seriesOptions(), [])
  const allBrands = useMemo(() => brandOptions(), [])

  // Only apply the filters that are visible for the active report period so
  // hidden controls never silently skew the monthly view.
  const filters: BdFilters =
    period === 'day'
      ? { series }
      : period === 'week'
        ? { series, brand }
        : {}

  const kpis = getBdKpis(bd, period, filters)
  const perf = getBdPerformanceMetrics(bd, period, filters)
  const funnel = getBdFunnel(bd, period, filters)
  const tasks = getBdTasks(bd, filters)
  const creators = getBdTopCreators(bd, filters)
  const targets = getBdTargets(bd, period, filters)
  const trend = getBdTrend(bd, period, language, filters)

  const isMonth = period === 'month'
  const scopeText =
    period === 'day'
      ? d('dailyScope')
      : period === 'week'
        ? d('weeklyScope')
        : d('monthlyScope')
  const reportLabel =
    period === 'day'
      ? d('dailyReport')
      : period === 'week'
        ? d('weeklyReport')
        : d('monthlyReport')

  return (
    <div className='space-y-4'>
      {/* Report scope + filters */}
      <div className='flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='shrink-0'>
            {reportLabel}
          </Badge>
          <p className='text-sm text-muted-foreground text-pretty'>
            {scopeText}
          </p>
        </div>
        {period !== 'month' && (
          <div className='flex flex-wrap items-center gap-2'>
            {period === 'week' && (
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className='h-9 w-[150px]' aria-label={d('brand')}>
                  <SelectValue placeholder={d('brand')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{d('allBrands')}</SelectItem>
                  {allBrands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={series} onValueChange={setSeries}>
              <SelectTrigger className='h-9 w-[150px]' aria-label={d('series')}>
                <SelectValue placeholder={d('series')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{d('allSeries')}</SelectItem>
                {allSeries.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* KPI row */}
      <div
        className={cn(
          'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
          isMonth ? 'xl:grid-cols-5' : 'lg:grid-cols-3'
        )}
      >
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

      {/* Monthly-only performance metrics */}
      {isMonth && perf.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{d('performance')}</CardTitle>
            <CardDescription>{d('performanceDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-7'>
              {perf.map((m) => {
                const up = m.delta >= 0
                return (
                  <div key={m.key} className='space-y-1'>
                    <p className='text-xs text-muted-foreground'>
                      {language === 'zh' ? m.labelZh : m.labelEn}
                    </p>
                    <p className='text-xl font-semibold tabular-nums'>
                      {m.display}
                    </p>
                    <p
                      className={cn(
                        'text-xs tabular-nums',
                        up
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-destructive'
                      )}
                    >
                      {up ? '+' : ''}
                      {m.delta}%
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
