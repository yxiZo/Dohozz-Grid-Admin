import { useLanguage } from '@/context/language-provider'
import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitch } from '@/components/language-switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LeadsView } from './components/leads-view'
import { leads } from './data/data'

export function Leads() {
  const { t } = useLanguage()

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <LanguageSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed fluid className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('leads.title')}
            </h2>
            <p className='text-muted-foreground'>{t('leads.subtitle')}</p>
          </div>
        </div>
        <LeadsView initialData={leads} />
      </Main>
    </>
  )
}
