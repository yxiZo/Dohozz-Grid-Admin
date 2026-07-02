import { useState } from 'react'
import { Download } from 'lucide-react'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { LanguageSwitch } from '@/components/language-switch'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdminDashboard } from './components/admin-dashboard'
import { BdDashboard } from './components/bd-dashboard'
import { LeadDashboard } from './components/lead-dashboard'
import { useDashboardDict } from './data/i18n'
import {
  bdList,
  periodOptions,
  roleOptions,
  type DashboardRole,
  type TimePeriod,
} from './data/metrics'

function greeting() {
  const h = new Date().getHours()
  const key =
    h < 12 ? 'greetingMorning' : h < 18 ? 'greetingAfternoon' : 'greetingEvening'
  return key as 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening'
}

export function Dashboard() {
  const { language } = useLanguage()
  const d = useDashboardDict(language)
  const [role, setRole] = useState<DashboardRole>('bd')
  const [period, setPeriod] = useState<TimePeriod>('month')
  const [bd, setBd] = useState<string>(bdList()[0])

  const roleLabel = (r: DashboardRole) => {
    const opt = roleOptions.find((o) => o.value === r)!
    return language === 'zh' ? opt.zh : opt.en
  }

  const headline =
    role === 'bd'
      ? `${d(greeting())}, ${bd}`
      : role === 'lead'
        ? d('teamOverview')
        : d('platformOverview')

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <LanguageSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        {/* Title + controls */}
        <div className='mb-4 flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {headline}
              </h1>
              <p className='text-sm text-muted-foreground'>{d('subtitle')}</p>
            </div>
            <Button variant='outline' size='sm'>
              <Download className='me-1.5 h-4 w-4' />
              {d('export')}
            </Button>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            {/* Role switcher */}
            <Select
              value={role}
              onValueChange={(v) => setRole(v as DashboardRole)}
            >
              <SelectTrigger className='w-[160px]'>
                <SelectValue>{roleLabel(role)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {language === 'zh' ? o.zh : o.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* BD selector (only for BD view) */}
            {role === 'bd' && (
              <Select value={bd} onValueChange={setBd}>
                <SelectTrigger className='w-[130px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bdList().map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Period switcher */}
            <Tabs
              value={period}
              onValueChange={(v) => setPeriod(v as TimePeriod)}
              className='ms-auto'
            >
              <TabsList>
                {periodOptions.map((o) => (
                  <TabsTrigger key={o.value} value={o.value}>
                    {language === 'zh' ? o.zh : o.en}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Role-specific workbench */}
        {role === 'bd' && (
          <BdDashboard bd={bd} period={period} language={language} />
        )}
        {role === 'lead' && (
          <LeadDashboard period={period} language={language} />
        )}
        {role === 'admin' && (
          <AdminDashboard period={period} language={language} />
        )}
      </Main>
    </>
  )
}
