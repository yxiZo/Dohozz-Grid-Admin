import {
  LayoutDashboard,
  UserPlus,
  PackageCheck,
  Clapperboard,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Users,
  Shield,
  KeyRound,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: '达人运营',
      items: [
        {
          title: '建联提报',
          url: '/creators/outreach',
          icon: UserPlus,
        },
        {
          title: '寄样管理',
          url: '/creators/samples',
          icon: PackageCheck,
        },
        {
          title: '视频验收',
          url: '/creators/videos',
          icon: Clapperboard,
        },
      ],
    },
    {
      title: '系统管理',
      items: [
        {
          title: '用户管理',
          url: '/users',
          icon: Users,
        },
        {
          title: '角色管理',
          url: '/system/roles',
          icon: Shield,
        },
        {
          title: '权限管理',
          url: '/system/permissions',
          icon: KeyRound,
        },
      ],
    },
  ],
}
