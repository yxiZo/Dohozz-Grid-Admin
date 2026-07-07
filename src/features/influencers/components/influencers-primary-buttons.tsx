import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInfluencers } from './influencers-provider'

export function InfluencersPrimaryButtons() {
  const { setOpen } = useInfluencers()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>新增达人</span> <Plus size={18} />
      </Button>
    </div>
  )
}
