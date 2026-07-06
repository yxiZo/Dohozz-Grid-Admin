import { useState } from 'react'
import { cn } from '@/lib/utils'
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
  // Collapse the page heading once the user starts scrolling the table/kanban,
  // so the data itself gets the maximum amount of vertical space.
  const [scrolled, setScrolled] = useState(false)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <LanguageSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed fluid className='flex flex-1 flex-col gap-3 sm:gap-4'>
        <div
          aria-hidden={scrolled}
          className={cn(
            'grid shrink-0 transition-[grid-template-rows,opacity] duration-200 ease-out',
            scrolled ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
          )}
        >
          <div className='overflow-hidden'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t(config.titleKey as TranslationKey)}
            </h2>
            <p className='text-muted-foreground'>
              {t(config.subtitleKey as TranslationKey)}
            </p>
          </div>
        </div>
        <CreatorsGrid stage={stage} onScrolledChange={setScrolled} />
      </Main>
    </>
  )
}
