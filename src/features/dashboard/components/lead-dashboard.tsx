import { type Language } from '@/context/language-provider'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDashboardDict } from '../data/i18n'
import {
  getBdLeaderboard,
  getTeamFunnel,
  getTeamKpis,
  getTeamTrend,
  type TimePeriod,
} from '../data/metrics'
import { FunnelChart, LeaderboardChart, TrendChart } from './dashboard-charts'
import { KpiCard } from './kpi-card'

type Props = {
  period: TimePeriod
  language: Language
}

export function LeadDashboard({ period, language }: Props) {
  const d = useDashboardDict(language)
  const kpis = getTeamKpis(period)
  const leaderboard = getBdLeaderboard(period)
  const funnel = getTeamFunnel(period)
  const trend = getTeamTrend(period, language)

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            kpi={kpi}
            label={language === 'zh' ? kpi.labelZh : kpi.labelEn}
            deltaSuffix={d('vsLast')}
          />
        ))}
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle>{d('teamTrend')}</CardTitle>
            <CardDescription>{d('myTrendDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <TrendChart data={trend} gmvLabel={d('gmv')} />
          </CardContent>
        </Card>
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>{d('teamFunnel')}</CardTitle>
            <CardDescription>{d('funnelDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart stages={funnel} conversionLabel={d('conversion')} />
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle>{d('leaderboard')}</CardTitle>
            <CardDescription>{d('leaderboardDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <LeaderboardChart
              data={leaderboard.map((r) => ({ name: r.bd, value: r.gmv }))}
              gmvLabel={d('gmv')}
            />
          </CardContent>
        </Card>
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>{d('leaderboard')}</CardTitle>
            <CardDescription>{d('leaderboardDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BD</TableHead>
                  <TableHead className='text-end'>{d('gmv')}</TableHead>
                  <TableHead className='text-end'>{d('outreach')}</TableHead>
                  <TableHead className='text-end'>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((r, i) => (
                  <TableRow key={r.bd}>
                    <TableCell className='flex items-center gap-2 font-medium'>
                      {i < 3 && (
                        <Badge
                          variant='secondary'
                          className='h-5 w-5 justify-center p-0 text-[10px]'
                        >
                          {i + 1}
                        </Badge>
                      )}
                      {r.bd}
                    </TableCell>
                    <TableCell className='text-end tabular-nums'>
                      ${r.gmv.toLocaleString('en-US')}
                    </TableCell>
                    <TableCell className='text-end tabular-nums'>
                      {r.outreach}
                    </TableCell>
                    <TableCell className='text-end tabular-nums'>
                      {r.fulfilled.toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
