import { useLanguage, type TranslationKey } from '@/context/language-provider'
import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitch } from '@/components/language-switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CreatorsGrid } from './components/creators-grid'
import { type CreatorStage, stageConfig } from './data/data'

type CreatorsProps = {
  stage: CreatorStage
}

export function Creators({ stage }: CreatorsProps) {
  const { t } = useLanguage()
  const config = stageConfig[stage]

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
              {t(config.titleKey as TranslationKey)}
            </h2>
            <p className='text-muted-foreground'>
              {t(config.subtitleKey as TranslationKey)}
            </p>
          </div>
        </div>
        <CreatorsGrid stage={stage} />
      </Main>
    </>
  )
}
