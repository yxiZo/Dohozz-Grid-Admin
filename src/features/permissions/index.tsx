import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getPermissions } from '@/services/permissions'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PermissionsDialogs } from './components/permissions-dialogs'
import { PermissionsPrimaryButtons } from './components/permissions-primary-buttons'
import { PermissionsProvider } from './components/permissions-provider'
import { PermissionsTable } from './components/permissions-table'

const route = getRouteApi('/_authenticated/system/permissions/')

export function Permissions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  })

  return (
    <PermissionsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>权限管理</h2>
            <p className='text-muted-foreground'>
              维护系统的权限点，按模块划分菜单与操作权限。
            </p>
          </div>
          <PermissionsPrimaryButtons />
        </div>
        <PermissionsTable data={permissions} search={search} navigate={navigate} />
      </Main>

      <PermissionsDialogs />
    </PermissionsProvider>
  )
}
