import { Link } from '@tanstack/react-router'
import { Logo } from '@/assets/logo'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function AppTitle() {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='gap-0 py-0 hover:bg-transparent active:bg-transparent'
          asChild
        >
          <div className='flex w-full items-center gap-2'>
            <Link
              to='/'
              onClick={() => setOpenMobile(false)}
              className='flex flex-1 items-center gap-2 text-start text-sm leading-tight'
            >
              <Logo className='size-7 shrink-0 rounded-md' />
              <div className='grid flex-1'>
                <span className='truncate font-bold'>DOHOZZ Admin</span>
                <span className='truncate text-xs'>达人营销运营平台</span>
              </div>
            </Link>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
