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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  type Creator,
  type CreatorStage,
  bdOptions,
  collabStatusOptions,
  collabTypeOptions,
  contentCategoryOptions,
  contentTypeOptions,
  countryOptions,
  dedupOptions,
  executionOptions,
  followerTierOptions,
  influencerCategoryOptions,
  presentationStyleOptions,
  reviewOptions,
  workingStatusOptions,
  yesNoOptions,
} from '../data/data'

type CreatorEditDialogProps = {
  stage: CreatorStage
  creator: Creator | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (creator: Creator) => void
}

type StringCreatorKey = {
  [K in keyof Creator]: Creator[K] extends string ? K : never
}[keyof Creator]

type NumberCreatorKey = {
  [K in keyof Creator]: Creator[K] extends number ? K : never
}[keyof Creator]

function initials(handle: string) {
  const h = (handle ?? '').replace(/^@/, '').trim()
  return h.slice(0, 2).toUpperCase() || '?'
}

function cloneCreator(creator: Creator | null) {
  return creator ? { ...creator } : null
}

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <Label className='text-xs text-muted-foreground'>{label}</Label>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className='col-span-full text-sm font-semibold text-foreground'>
      {children}
    </h4>
  )
}

export function CreatorEditDialog({
  stage,
  creator,
  open,
  onOpenChange,
  onSave,
}: CreatorEditDialogProps) {
  const [draft, setDraft] = useState<Creator | null>(() =>
    cloneCreator(creator)
  )

  if (!draft) return null

  const set = <K extends keyof Creator>(key: K, value: Creator[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const numberValue = (value: string) => (value === '' ? 0 : Number(value))

  const renderTextField = (
    field: StringCreatorKey,
    label: string,
    type: 'text' | 'date' | 'email' | 'url' = 'text'
  ) => (
    <FormField label={label}>
      <Input
        type={type}
        value={draft[field]}
        onChange={(e) => set(field, e.target.value)}
      />
    </FormField>
  )

  const renderTextareaField = (field: StringCreatorKey, label: string) => (
    <div className='col-span-full'>
      <FormField label={label}>
        <Textarea
          value={draft[field]}
          onChange={(e) => set(field, e.target.value)}
          rows={2}
        />
      </FormField>
    </div>
  )

  const renderNumberField = (
    field: NumberCreatorKey,
    label: string,
    options?: { min?: number; max?: number; step?: number }
  ) => (
    <FormField label={label}>
      <Input
        type='number'
        min={options?.min}
        max={options?.max}
        step={options?.step}
        value={draft[field]}
        onChange={(e) => set(field, numberValue(e.target.value))}
      />
    </FormField>
  )

  const renderSelectField = (
    field: StringCreatorKey,
    label: string,
    options: readonly string[]
  ) => (
    <FormField label={label}>
      <Select value={draft[field]} onValueChange={(value) => set(field, value)}>
        <SelectTrigger className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormField>
  )

  const handleSave = () => {
    onSave(draft)
    onOpenChange(false)
  }

  const renderIdentitySection = () => (
    <>
      <SectionTitle>基础信息</SectionTitle>
      {renderTextField('tiktokId', 'Tiktok ID')}
      {renderTextField('series', 'Series')}
      {renderTextField('profile', 'Profile', 'url')}
      {renderSelectField('bd', 'BD', bdOptions)}
      {renderNumberField('follower', 'Follower')}
      {renderSelectField('followerTier', 'Follower Tier', followerTierOptions)}
      {renderTextField('email', 'Email', 'email')}
      {renderTextField('whatsapp', 'Whatsapp')}
      {renderTextField('instagram', 'Instagram')}
      {renderTextField('facebook', 'Facebook')}
    </>
  )

  const renderOutreachSection = () => (
    <>
      <Separator className='col-span-full' />
      <SectionTitle>提报审核</SectionTitle>
      {renderSelectField('dedup', '查重', dedupOptions)}
      {renderSelectField('review', '审核', reviewOptions)}
      {renderSelectField(
        'workingStatus',
        'Working Status',
        workingStatusOptions
      )}
      {renderSelectField('execution', 'Execution 执行力', executionOptions)}
      {renderTextareaField('notApprovalReason', 'Not Approval Reason')}

      <Separator className='col-span-full' />
      <SectionTitle>内容与合作</SectionTitle>
      {renderSelectField(
        'contentCategory',
        '内容类目 Content Category',
        contentCategoryOptions
      )}
      {renderTextField('influencerFeatures', '博主特点 Influencer Features')}
      {renderSelectField(
        'collabType',
        'Collab Type 合作类型',
        collabTypeOptions
      )}
      {renderSelectField('contentType', 'Content Type', contentTypeOptions)}
      {renderTextField('dateRegistration', 'Date Registration', 'date')}
      {renderTextField('collabDate', 'Collab Date', 'date')}
      {renderNumberField('agreedVideos', '约定视频数')}
      {renderNumberField('completedVideos', '已完成视频条数')}
      {renderNumberField('collabAmount', 'Collab Amount')}
      {renderNumberField('videoAmount', 'Video Amount')}
      {renderNumberField('gmv', 'GMV')}
      {renderNumberField('avgExposure', 'AVG Exposure Count')}
      {renderNumberField('fulfilledCollab', 'Fulfilled Collab 履约数')}
      {renderNumberField('fulfilledRate', 'Fulfilled Rate 履约率 (0-1)', {
        min: 0,
        max: 1,
        step: 0.01,
      })}
      {renderNumberField('avgPublishDays', '平均发布用时 (天)')}
      {renderTextField('collabSku', 'Collab SKU')}
    </>
  )

  const renderSampleSection = () => (
    <>
      <Separator className='col-span-full' />
      <SectionTitle>寄样管理</SectionTitle>
      {renderTextField('collabCode', 'Collab 合作编码')}
      {renderTextField('dateSampleSend', 'Date Sample Send 寄样时间', 'date')}
      {renderTextField('brand', '品牌')}
      {renderTextField('sku', 'SKU')}
      {renderSelectField('collabType', 'Collab Type', collabTypeOptions)}
      {renderSelectField(
        'collabStatus',
        'Collab Status 合作状态',
        collabStatusOptions
      )}
      {renderTextField('videoLink', 'Video Link', 'url')}
      {renderSelectField('hasSales', '是否出单达人', yesNoOptions)}
      {renderNumberField('gmv', 'GMV')}
      {renderNumberField('fulfilledRate', '完成度 (0-1)', {
        min: 0,
        max: 1,
        step: 0.01,
      })}
      {renderTextField('collabSku', 'Collab SKU')}
    </>
  )

  const renderVideoSection = () => (
    <>
      <Separator className='col-span-full' />
      <SectionTitle>视频验收</SectionTitle>
      {renderTextField('videoPublishedDate', '视频发布日期', 'date')}
      {renderTextField('dateVideoPost', 'Date Video Post（填表日期）', 'date')}
      {renderTextField('sku', 'SKU')}
      {renderTextField('videoLink', 'Video Link', 'url')}
      {renderTextField('videoEncoding', 'Video Encoding')}
      {renderSelectField(
        'influencerCategory',
        'Influencer Category',
        influencerCategoryOptions
      )}
      {renderSelectField(
        'presentationStyle',
        'Presentation Style',
        presentationStyleOptions
      )}
      {renderTextField('videoContent', 'Video Content')}
      {renderTextField('videoScript', 'Video Script')}
      {renderTextField('tiktokIdLink', 'Tiktok ID（链接', 'url')}
      {renderSelectField('country', 'Country', countryOptions)}
      {renderTextField('videoCode', '视频code')}
      {renderSelectField(
        'contentCategory',
        'Content Category',
        contentCategoryOptions
      )}
      {renderSelectField('collabType', 'Collab Type', collabTypeOptions)}
      {renderSelectField('hasSales', '是否出单', yesNoOptions)}
      {renderNumberField('cumulativeInteractions', '互动量（累计）')}
      {renderNumberField('likes', '点赞数')}
      {renderNumberField('comments', '评论数')}
      {renderNumberField('shares', '分享数')}
      {renderNumberField('productExposuresCumulative', '商品曝光次数（累计）')}
      {renderNumberField('productClicks', '商品点击次数')}
      {renderNumberField('interactionRate', '互动率 (0-1)', {
        min: 0,
        max: 1,
        step: 0.0001,
      })}
      {renderNumberField('dealPieces', '成交件数')}
      {renderNumberField('gmv', 'GMV（总）')}
      {renderTextField('scriptDirection', '脚本方向')}
      {renderTextField('skuCopy', 'SKU副本')}
      {renderTextField('tiktokIdCopy', 'Tiktok ID副本')}
      {renderTextField('bdCopy', 'BD 副本')}
      {renderTextField('collabTypeCopy', 'Collab Type副本')}
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-4xl'>
        <DialogHeader className='border-b p-6'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-11'>
              <AvatarFallback className='bg-primary/10 font-medium text-primary'>
                {initials(draft.tiktokId)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{draft.tiktokId || '新达人'}</DialogTitle>
              <DialogDescription>
                编辑当前阶段信息，保存后即时生效
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh]'>
          <div className='grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3'>
            {renderIdentitySection()}
            {stage === 'outreach' && renderOutreachSection()}
            {stage === 'samples' && renderSampleSection()}
            {stage === 'videos' && renderVideoSection()}
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
