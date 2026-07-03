import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, ChevronsUpDown, Check } from 'lucide-react'
import { getTeams } from '@/services/teams'
import { useTeamStore } from '@/stores/team-store'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { selectedTeamId, setSelectedTeamId } = useTeamStore()

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  // 首次加载后，若未选中团队则默认选第一个。
  useEffect(() => {
    if (teams.length === 0) return
    if (selectedTeamId == null || !teams.some((t) => t.id === selectedTeamId)) {
      setSelectedTeamId(teams[0].id)
    }
  }, [teams, selectedTeamId, setSelectedTeamId])

  const activeTeam = teams.find((t) => t.id === selectedTeamId) ?? teams[0]

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
                  {activeTeam
                    ? `${activeTeam.countries.length} 个国家`
                    : '当前团队'}
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
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className='gap-2'
              >
                <div className='flex size-6 items-center justify-center rounded-md border'>
                  <Building2 className='size-3.5 shrink-0' />
                </div>
                <span className='flex-1 truncate'>{team.team_name}</span>
                <Check
                  className={cn(
                    'size-4',
                    team.id === activeTeam?.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
