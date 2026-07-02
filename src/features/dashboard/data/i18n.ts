// Local bilingual labels for the dashboard feature. Kept out of the global
// language-provider to avoid bloating its strict TranslationKey union with
// dozens of dashboard-only strings. Select with the active `language`.

import { type Language } from '@/context/language-provider'

const dict = {
  zh: {
    title: '数据工作台',
    subtitle: '按角色聚焦的运营数据分析',
    role: '角色视角',
    greetingMorning: '早上好',
    greetingAfternoon: '下午好',
    greetingEvening: '晚上好',
    bdSelector: 'BD',
    export: '导出报表',
    // BD view
    myTrend: '我的业绩趋势',
    myTrendDesc: 'GMV 与建联走势',
    funnel: '转化漏斗',
    funnelDesc: '建联到出单的转化路径',
    tasks: '待办任务',
    tasksDesc: '需要你处理的事项',
    myCreators: '我负责的达人',
    myCreatorsDesc: '按 GMV 排序 Top 5',
    targets: '目标进度',
    targetsDesc: '本期目标完成情况',
    // Lead view
    teamOverview: '团队概览',
    leaderboard: 'BD 业绩排行',
    leaderboardDesc: '按 GMV 排序',
    teamTrend: '团队 GMV 趋势',
    teamFunnel: '团队转化漏斗',
    // Admin view
    platformOverview: '平台概览',
    countryDist: '国家分布',
    countryDistDesc: '达人所在市场',
    categoryDist: '类目分布',
    categoryDistDesc: '内容类目占比',
    platformTrend: '平台 GMV 趋势',
    // shared
    gmv: 'GMV',
    outreach: '建联',
    vsLast: '较上期',
    noData: '暂无数据',
    viewAll: '查看全部',
    process: '去处理',
    conversion: '转化率',
  },
  en: {
    title: 'Analytics Workbench',
    subtitle: 'Role-focused operational analytics',
    role: 'Role View',
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    bdSelector: 'BD',
    export: 'Export',
    myTrend: 'My Performance Trend',
    myTrendDesc: 'GMV and outreach over time',
    funnel: 'Conversion Funnel',
    funnelDesc: 'From outreach to conversion',
    tasks: 'My Tasks',
    tasksDesc: 'Items awaiting your action',
    myCreators: 'My Creators',
    myCreatorsDesc: 'Top 5 by GMV',
    targets: 'Target Progress',
    targetsDesc: 'Goal completion this period',
    teamOverview: 'Team Overview',
    leaderboard: 'BD Leaderboard',
    leaderboardDesc: 'Ranked by GMV',
    teamTrend: 'Team GMV Trend',
    teamFunnel: 'Team Conversion Funnel',
    platformOverview: 'Platform Overview',
    countryDist: 'Country Distribution',
    countryDistDesc: 'Creator markets',
    categoryDist: 'Category Distribution',
    categoryDistDesc: 'Content category share',
    platformTrend: 'Platform GMV Trend',
    gmv: 'GMV',
    outreach: 'Outreach',
    vsLast: 'vs last period',
    noData: 'No data',
    viewAll: 'View all',
    process: 'Handle',
    conversion: 'Conversion',
  },
} as const

export type DashboardLabelKey = keyof (typeof dict)['zh']

export function useDashboardDict(language: Language) {
  return (key: DashboardLabelKey) => dict[language][key]
}
