import { type Language } from '@/context/language-provider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDashboardDict } from '../data/i18n'
import {
  getBdLeaderboard,
  getCategoryDistribution,
  getCountryDistribution,
  getPlatformKpis,
  getPlatformTrend,
  type TimePeriod,
} from '../data/metrics'
import { BarList, LeaderboardChart, TrendChart } from './dashboard-charts'
import { KpiCard } from './kpi-card'

type Props = {
  period: TimePeriod
  language: Language
}

export function AdminDashboard({ period, language }: Props) {
  const d = useDashboardDict(language)
  const kpis = getPlatformKpis(period)
  const countries = getCountryDistribution()
  const categories = getCategoryDistribution()
  const trend = getPlatformTrend(period, language)
  const leaderboard = getBdLeaderboard(period)

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
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
            <CardTitle>{d('platformTrend')}</CardTitle>
            <CardDescription>{d('myTrendDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <TrendChart data={trend} gmvLabel={d('gmv')} />
          </CardContent>
        </Card>
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>{d('countryDist')}</CardTitle>
            <CardDescription>{d('countryDistDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='pt-4'>
            <BarList items={countries} colored />
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
            <CardTitle>{d('categoryDist')}</CardTitle>
            <CardDescription>{d('categoryDistDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='pt-4'>
            <BarList items={categories} colored />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
