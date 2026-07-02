import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  type Creator,
  bdOptions,
  collabTypeOptions,
  contentCategoryOptions,
  contentTypeOptions,
  dedupOptions,
  executionOptions,
  followerTierOptions,
  reviewOptions,
  workingStatusOptions,
} from '../data/data'

type CreatorEditDialogProps = {
  creator: Creator | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (creator: Creator) => void
}

function initials(handle: string) {
  const h = (handle ?? '').replace(/^@/, '').trim()
  return h.slice(0, 2).toUpperCase() || '?'
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <Label className='text-muted-foreground text-xs'>{label}</Label>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className='text-foreground col-span-full text-sm font-semibold'>
      {children}
    </h4>
  )
}

export function CreatorEditDialog({
  creator,
  open,
  onOpenChange,
  onSave,
}: CreatorEditDialogProps) {
  const [draftState, setDraftState] = useState(() => ({
    source: creator,
    value: creator,
  }))

  if (draftState.source !== creator) {
    setDraftState({ source: creator, value: creator })
  }

  const draft = draftState.value

  if (!draft) return null

  const set = <K extends keyof Creator>(key: K, value: Creator[K]) =>
    setDraftState((prev) =>
      prev.value ? { ...prev, value: { ...prev.value, [key]: value } } : prev
    )

  const num = (v: string) => (v === '' ? 0 : Number(v))

  const handleSave = () => {
    if (draft) onSave(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl'>
        <DialogHeader className='space-y-0 border-b p-6'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-11'>
              <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                {initials(draft.tiktokId)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{draft.tiktokId || '新达人'}</DialogTitle>
              <DialogDescription>编辑达人信息，保存后即时生效</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh]'>
          <div className='grid grid-cols-1 gap-4 p-6 sm:grid-cols-2'>
            <SectionTitle>基础信息</SectionTitle>
            <Field label='Tiktok ID'>
              <Input
                value={draft.tiktokId}
                onChange={(e) => set('tiktokId', e.target.value)}
              />
            </Field>
            <Field label='Series'>
              <Input
                value={draft.series}
                onChange={(e) => set('series', e.target.value)}
              />
            </Field>
            <Field label='Profile'>
              <Input
                value={draft.profile}
                onChange={(e) => set('profile', e.target.value)}
              />
            </Field>
            <Field label='Date Registration'>
              <Input
                type='date'
                value={draft.dateRegistration}
                onChange={(e) => set('dateRegistration', e.target.value)}
              />
            </Field>
            <Field label='BD'>
              <Select value={draft.bd} onValueChange={(v) => set('bd', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bdOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='Follower'>
              <Input
                type='number'
                value={draft.follower}
                onChange={(e) => set('follower', num(e.target.value))}
              />
            </Field>
            <Field label='Follower Tier'>
              <Select
                value={draft.followerTier}
                onValueChange={(v) => set('followerTier', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {followerTierOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Separator className='col-span-full' />
            <SectionTitle>审核与状态</SectionTitle>
            <Field label='查重'>
              <Select value={draft.dedup} onValueChange={(v) => set('dedup', v as Creator['dedup'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dedupOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='审核'>
              <Select value={draft.review} onValueChange={(v) => set('review', v as Creator['review'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reviewOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='Working Status'>
              <Select
                value={draft.workingStatus}
                onValueChange={(v) => set('workingStatus', v as Creator['workingStatus'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workingStatusOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='Execution 执行力'>
              <Select
                value={draft.execution}
                onValueChange={(v) => set('execution', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {executionOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className='col-span-full'>
              <Field label='Not Approval Reason'>
                <Textarea
                  value={draft.notApprovalReason}
                  onChange={(e) => set('notApprovalReason', e.target.value)}
                  rows={2}
                />
              </Field>
            </div>

            <Separator className='col-span-full' />
            <SectionTitle>内容与合作</SectionTitle>
            <Field label='内容类目 Content Category'>
              <Select
                value={draft.contentCategory}
                onValueChange={(v) => set('contentCategory', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentCategoryOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='博主特点 Influencer Features'>
              <Input
                value={draft.influencerFeatures}
                onChange={(e) => set('influencerFeatures', e.target.value)}
              />
            </Field>
            <Field label='Collab Type 合作类型'>
              <Select
                value={draft.collabType}
                onValueChange={(v) => set('collabType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {collabTypeOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='Content Type'>
              <Select
                value={draft.contentType}
                onValueChange={(v) => set('contentType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label='Collab SKU'>
              <Input
                value={draft.collabSku}
                onChange={(e) => set('collabSku', e.target.value)}
              />
            </Field>
            <Field label='Collab Date'>
              <Input
                type='date'
                value={draft.collabDate}
                onChange={(e) => set('collabDate', e.target.value)}
              />
            </Field>

            <Separator className='col-span-full' />
            <SectionTitle>联系方式</SectionTitle>
            <Field label='Whatsapp'>
              <Input
                value={draft.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
              />
            </Field>
            <Field label='Email'>
              <Input
                value={draft.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </Field>
            <Field label='Instagram'>
              <Input
                value={draft.instagram}
                onChange={(e) => set('instagram', e.target.value)}
              />
            </Field>
            <Field label='Facebook'>
              <Input
                value={draft.facebook}
                onChange={(e) => set('facebook', e.target.value)}
              />
            </Field>

            <Separator className='col-span-full' />
            <SectionTitle>履约与业绩</SectionTitle>
            <Field label='约定视频数'>
              <Input
                type='number'
                value={draft.agreedVideos}
                onChange={(e) => set('agreedVideos', num(e.target.value))}
              />
            </Field>
            <Field label='已完成视频条数'>
              <Input
                type='number'
                value={draft.completedVideos}
                onChange={(e) => set('completedVideos', num(e.target.value))}
              />
            </Field>
            <Field label='Collab Amount'>
              <Input
                type='number'
                value={draft.collabAmount}
                onChange={(e) => set('collabAmount', num(e.target.value))}
              />
            </Field>
            <Field label='Video Amount'>
              <Input
                type='number'
                value={draft.videoAmount}
                onChange={(e) => set('videoAmount', num(e.target.value))}
              />
            </Field>
            <Field label='GMV'>
              <Input
                type='number'
                value={draft.gmv}
                onChange={(e) => set('gmv', num(e.target.value))}
              />
            </Field>
            <Field label='AVG Exposure Count'>
              <Input
                type='number'
                value={draft.avgExposure}
                onChange={(e) => set('avgExposure', num(e.target.value))}
              />
            </Field>
            <Field label='Fulfilled Collab 履约数'>
              <Input
                type='number'
                value={draft.fulfilledCollab}
                onChange={(e) => set('fulfilledCollab', num(e.target.value))}
              />
            </Field>
            <Field label='Fulfilled Rate 履约率 (0-1)'>
              <Input
                type='number'
                step='0.01'
                min='0'
                max='1'
                value={draft.fulfilledRate}
                onChange={(e) => set('fulfilledRate', num(e.target.value))}
              />
            </Field>
            <Field label='平均发布用时 (天)'>
              <Input
                type='number'
                value={draft.avgPublishDays}
                onChange={(e) => set('avgPublishDays', num(e.target.value))}
              />
            </Field>
          </div>
        </ScrollArea>

        <DialogFooter className='border-t p-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
