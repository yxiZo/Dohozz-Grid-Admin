import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LeadsGrid } from './components/leads-grid'
import { leads } from './data/data'

export function Leads() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>客户 / 线索管理</h2>
            <p className='text-muted-foreground'>
              像 Excel 一样直接编辑的表格，编辑后立即生效，无需保存。
            </p>
          </div>
        </div>
        <LeadsGrid initialData={leads} />
      </Main>
    </>
  )
}
