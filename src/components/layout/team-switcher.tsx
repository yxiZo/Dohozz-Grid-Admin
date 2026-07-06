import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, ChevronsUpDown, Check, Globe } from 'lucide-react'
import { getTeams } from '@/services/teams'
import { useTeamStore } from '@/stores/team-store'
import type { Team } from '@/features/teams/data/schema'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

/** 该团队是否需要先选国家才能确定最终团队 */
function needsCountrySelection(team: Team) {
  return team.countries.length > 1
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { selectedTeamId, selectedCountryId, setSelection } = useTeamStore()

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const activeTeam = teams.find((t) => t.id === selectedTeamId) ?? teams[0]
  const activeCountry =
    activeTeam?.countries.find((c) => c.id === selectedCountryId) ?? null

  // 首次加载后，若未选中有效的团队/国家，则给出默认选择。
  useEffect(() => {
    if (teams.length === 0) return
    const current = teams.find((t) => t.id === selectedTeamId)
    if (!current) {
      // 尚未选团队：默认第一个团队，单国家团队直接选中该国家。
      const first = teams[0]
      const defaultCountry =
        first.countries.length === 1 ? first.countries[0].id : null
      setSelection(first.id, defaultCountry)
      return
    }
    // 已选团队，但国家状态无效：多国家团队要求选国家，单国家团队直接补齐。
    const countryValid =
      selectedCountryId != null &&
      current.countries.some((c) => c.id === selectedCountryId)
    if (current.countries.length === 1 && !countryValid) {
      setSelection(current.id, current.countries[0].id)
    }
  }, [teams, selectedTeamId, selectedCountryId, setSelection])

  const triggerSubtitle = activeTeam
    ? activeCountry
      ? activeCountry.country_name
      : needsCountrySelection(activeTeam)
        ? '请选择国家'
        : (activeTeam.countries[0]?.country_name ?? '无国家')
    : '当前团队'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <Building2 className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {isLoading ? '加载中…' : (activeTeam?.team_name ?? '选择团队')}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  {triggerSubtitle}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              切换团队
            </DropdownMenuLabel>
            {teams.map((team) => {
              const isActiveTeam = team.id === activeTeam?.id
              // 多国家团队：展开子菜单选择具体国家。
              if (needsCountrySelection(team)) {
                return (
                  <DropdownMenuSub key={team.id}>
                    <DropdownMenuSubTrigger className='gap-2'>
                      <div className='flex size-6 items-center justify-center rounded-md border'>
                        <Building2 className='size-3.5 shrink-0' />
                      </div>
                      <span className='flex-1 truncate'>{team.team_name}</span>
                      <Check
                        className={cn(
                          'size-4',
                          isActiveTeam ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className='min-w-44'>
                      <DropdownMenuLabel className='text-muted-foreground text-xs'>
                        选择国家
                      </DropdownMenuLabel>
                      {team.countries.map((country) => (
                        <DropdownMenuItem
                          key={country.id}
                          onClick={() => setSelection(team.id, country.id)}
                          className='gap-2'
                        >
                          <Globe className='size-3.5 shrink-0' />
                          <span className='flex-1 truncate'>
                            {country.country_name}
                          </span>
                          <Check
                            className={cn(
                              'size-4',
                              isActiveTeam && country.id === selectedCountryId
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )
              }

              // 单国家（或无国家）团队：直接选中。
              const onlyCountryId = team.countries[0]?.id ?? null
              return (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => setSelection(team.id, onlyCountryId)}
                  className='gap-2'
                >
                  <div className='flex size-6 items-center justify-center rounded-md border'>
                    <Building2 className='size-3.5 shrink-0' />
                  </div>
                  <span className='flex-1 truncate'>{team.team_name}</span>
                  <Check
                    className={cn(
                      'size-4',
                      isActiveTeam ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
