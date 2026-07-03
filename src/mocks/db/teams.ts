import type { Country, Team } from '@/features/teams/data/schema'

// 主国家列表，team.countries 从这里挑选，保证 id 与名称一致。
export const mockCountries: Country[] = [
  { id: 1, country_code: 'MY', country_name: '马来西亚' },
  { id: 2, country_code: 'ID', country_name: '印度尼西亚' },
  { id: 3, country_code: 'TH', country_name: '泰国' },
  { id: 4, country_code: 'SG', country_name: '新加坡' },
  { id: 5, country_code: 'VN', country_name: '越南' },
  { id: 6, country_code: 'PH', country_name: '菲律宾' },
  { id: 7, country_code: 'US', country_name: '美国' },
]

const country = (id: number) =>
  mockCountries.find((c) => c.id === id) as Country

export const mockTeams: Team[] = [
  {
    id: 1,
    team_name: 'Team A',
    team_type: 'business',
    company_id: 1,
    status: 1,
    countries: [country(1), country(3)],
  },
  {
    id: 2,
    team_name: 'Team B',
    team_type: 'business',
    company_id: 1,
    status: 1,
    countries: [country(4), country(3)],
  },
  {
    id: 3,
    team_name: '外部中台团队',
    team_type: 'middleware',
    company_id: 1,
    status: 1,
    countries: [country(2), country(5), country(6)],
  },
]
