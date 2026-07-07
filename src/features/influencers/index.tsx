import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getInfluencers } from '@/services/influencers'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { InfluencersDialogs } from './components/influencers-dialogs'
import { InfluencersPrimaryButtons } from './components/influencers-primary-buttons'
import { InfluencersProvider } from './components/influencers-provider'
import { InfluencersTable } from './components/influencers-table'

const route = getRouteApi('/_authenticated/influencers/')

export function Influencers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data: influencers = [] } = useQuery({
    queryKey: ['influencers'],
    queryFn: getInfluencers,
  })

  return (
    <InfluencersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>达人管理</h2>
            <p className='text-muted-foreground'>
              管理跨平台达人的基础档案、联系方式与合作状态。
            </p>
          </div>
          <InfluencersPrimaryButtons />
        </div>
        <InfluencersTable
          data={influencers}
          search={search}
          navigate={navigate}
        />
      </Main>

      <InfluencersDialogs />
    </InfluencersProvider>
  )
}
