import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { type Distribution, type FunnelStage, type TrendPoint } from '../data/metrics'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function currency(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

// ------- Trend area chart: GMV -------
export function TrendChart({
  data,
  gmvLabel,
}: {
  data: TrendPoint[]
  gmvLabel: string
}) {
  return (
    <ResponsiveContainer width='100%' height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id='gmvFill' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='var(--chart-1)' stopOpacity={0.3} />
            <stop offset='100%' stopColor='var(--chart-1)' stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray='3 3'
          vertical={false}
          stroke='var(--border)'
        />
        <XAxis
          dataKey='name'
          stroke='var(--muted-foreground)'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='var(--muted-foreground)'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)}
        />
        <Tooltip
          cursor={{ stroke: 'var(--border)' }}
          contentStyle={{
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--popover-foreground)',
          }}
          formatter={(value) => [currency(Number(value ?? 0)), gmvLabel]}
        />
        <Area
          type='monotone'
          dataKey='gmv'
          stroke='var(--chart-1)'
          strokeWidth={2}
          fill='url(#gmvFill)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ------- Funnel: horizontal shrinking bars -------
export function FunnelChart({
  stages,
  conversionLabel,
}: {
  stages: FunnelStage[]
  conversionLabel: string
  lang?: 'zh' | 'en'
}) {
  const max = Math.max(...stages.map((s) => s.value), 1)
  const first = stages[0]?.value || 1
  return (
    <div className='space-y-3'>
      {stages.map((s, i) => {
        const width = `${Math.max(8, Math.round((s.value / max) * 100))}%`
        const conv = first > 0 ? Math.round((s.value / first) * 100) : 0
        return (
          <div key={s.labelEn} className='space-y-1'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-medium text-foreground'>
                {s.labelZh} / {s.labelEn}
              </span>
              <span className='text-muted-foreground tabular-nums'>
                {s.value.toLocaleString('en-US')}
                {i > 0 && (
                  <span className='ms-2 text-[11px]'>
                    {conversionLabel} {conv}%
                  </span>
                )}
              </span>
            </div>
            <div className='h-8 w-full overflow-hidden rounded-md bg-muted'>
              <div
                className='flex h-full items-center rounded-md px-2 text-xs font-medium text-background transition-all'
                style={{
                  width,
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ------- Horizontal ranked bar list -------
export function BarList({
  items,
  valueFormatter,
  colored = false,
}: {
  items: Distribution[]
  valueFormatter?: (n: number) => string
  colored?: boolean
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-3'>
      {items.map((item, i) => {
        const width = `${Math.max(4, Math.round((item.value / max) * 100))}%`
        return (
          <li key={item.name} className='flex items-center gap-3'>
            <span className='w-16 shrink-0 truncate text-xs text-muted-foreground'>
              {item.name}
            </span>
            <div className='h-2.5 flex-1 rounded-full bg-muted'>
              <div
                className='h-2.5 rounded-full'
                style={{
                  width,
                  backgroundColor: colored
                    ? CHART_COLORS[i % CHART_COLORS.length]
                    : 'var(--chart-1)',
                }}
              />
            </div>
            <span className='w-12 shrink-0 text-end text-xs font-medium tabular-nums'>
              {valueFormatter ? valueFormatter(item.value) : item.value}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// ------- Vertical leaderboard bar chart -------
export function LeaderboardChart({
  data,
  gmvLabel,
}: {
  data: { name: string; value: number }[]
  gmvLabel: string
}) {
  return (
    <ResponsiveContainer width='100%' height={280}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray='3 3'
          vertical={false}
          stroke='var(--border)'
        />
        <XAxis
          dataKey='name'
          stroke='var(--muted-foreground)'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='var(--muted-foreground)'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          contentStyle={{
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--popover-foreground)',
          }}
          formatter={(value) => [currency(Number(value ?? 0)), gmvLabel]}
        />
        <Bar dataKey='value' radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
