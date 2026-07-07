'use client'

import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  createInfluencer,
  updateInfluencer,
  type InfluencerPayload,
} from '@/services/influencers'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  contactChannels,
  countries,
  influencerSources,
  influencerStatuses,
  platforms,
} from '../data/data'
import { type Influencer } from '../data/schema'

const contactFormSchema = z.object({
  channelId: z.enum(['email', 'line', 'whatsapp', 'instagram', 'facebook']),
  value: z.string().min(1, '请输入联系方式。'),
  isPrimary: z.boolean(),
  remark: z.string().optional(),
})

const formSchema = z.object({
  displayName: z.string().min(1, '请输入达人名称。'),
  platformId: z.string().min(1, '请选择平台。'),
  platformUid: z.string().min(1, '请输入平台 UID。'),
  handle: z.string().optional(),
  countryId: z.string().min(1, '请选择国家/地区。'),
  status: z.enum(['active', 'inactive', 'blacklisted']),
  source: z.enum(['manual', 'scraper', 'referral']),
  followerCountSnapshot: z.string().optional(),
  avatarUrl: z.string().optional(),
  remark: z.string().optional(),
  contacts: z.array(contactFormSchema),
})
type InfluencerForm = z.infer<typeof formSchema>

type Props = {
  currentRow?: Influencer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InfluencersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<InfluencerForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          displayName: currentRow.displayName,
          platformId: currentRow.platformId,
          platformUid: currentRow.platformUid,
          handle: currentRow.handle ?? '',
          countryId: String(currentRow.countryId),
          status: currentRow.status,
          source: currentRow.source ?? 'manual',
          followerCountSnapshot:
            currentRow.followerCountSnapshot != null
              ? String(currentRow.followerCountSnapshot)
              : '',
          avatarUrl: currentRow.avatarUrl ?? '',
          remark: currentRow.remark ?? '',
          contacts: currentRow.contacts.map((c) => ({
            channelId: c.channelId,
            value: c.value,
            isPrimary: c.isPrimary,
            remark: c.remark ?? '',
          })),
        }
      : {
          displayName: '',
          platformId: '',
          platformUid: '',
          handle: '',
          countryId: '',
          status: 'active',
          source: 'manual',
          followerCountSnapshot: '',
          avatarUrl: '',
          remark: '',
          contacts: [{ channelId: 'email', value: '', isPrimary: true, remark: '' }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  })

  const contacts = form.watch('contacts')

  const setPrimary = (index: number) => {
    contacts.forEach((_, i) =>
      form.setValue(`contacts.${i}.isPrimary`, i === index)
    )
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (values: InfluencerForm) => {
      const country = countries.find(
        (c) => String(c.value) === values.countryId
      )
      const payload: InfluencerPayload = {
        displayName: values.displayName,
        platformId: values.platformId,
        platformUid: values.platformUid,
        handle: values.handle || undefined,
        countryId: Number(values.countryId),
        countryName: country?.label ?? '未知',
        status: values.status,
        source: values.source,
        followerCountSnapshot: values.followerCountSnapshot
          ? Number(values.followerCountSnapshot)
          : null,
        avatarUrl: values.avatarUrl || undefined,
        remark: values.remark || undefined,
        contacts: values.contacts.map((c) => ({
          channelId: c.channelId,
          value: c.value,
          isPrimary: c.isPrimary,
          remark: c.remark || undefined,
        })),
      }
      return isEdit
        ? updateInfluencer(currentRow.id, payload)
        : createInfluencer(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] })
      toast.success(isEdit ? '达人已更新。' : '达人已创建。')
      form.reset()
      onOpenChange(false)
    },
    onError: () => toast.error('保存失败，请检查平台 UID 是否重复。'),
  })

  const onSubmit = (values: InfluencerForm) => {
    // 至少保证一个主联系方式
    if (values.contacts.length > 0 && !values.contacts.some((c) => c.isPrimary)) {
      values.contacts[0].isPrimary = true
    }
    mutate(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑达人' : '新增达人'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? '修改达人基础信息与联系方式。'
              : '录入达人基础信息与至少一个联系方式。'}
            完成后点击保存。
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='-mr-4 max-h-[70vh] pr-4'>
          <Form {...form}>
            <form
              id='influencer-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='displayName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>达人名称</FormLabel>
                      <FormControl>
                        <Input placeholder='达人展示名' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='handle'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Handle</FormLabel>
                      <FormControl>
                        <Input placeholder='例如：beauty_jane' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='platformId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>平台</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='选择平台'
                        items={platforms.map((p) => ({
                          label: p.label,
                          value: p.value,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='platformUid'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>平台 UID</FormLabel>
                      <FormControl>
                        <Input placeholder='平台内唯一 ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='countryId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>国家/地区</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='选择国家/地区'
                        items={countries.map((c) => ({
                          label: c.label,
                          value: String(c.value),
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='followerCountSnapshot'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>粉丝数</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='最新粉丝数快照'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='选择状态'
                        items={influencerStatuses.map((s) => ({ ...s }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='source'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>来源</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='选择来源'
                        items={influencerSources.map((s) => ({ ...s }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='remark'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>运营备注</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='合作情况、报价、注意事项等'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 联系方式（一对多） */}
              <div className='space-y-3 rounded-lg border p-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium'>联系方式</p>
                    <p className='text-xs text-muted-foreground'>
                      点击星标设为主联系方式。
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      append({
                        channelId: 'email',
                        value: '',
                        isPrimary: fields.length === 0,
                        remark: '',
                      })
                    }
                  >
                    <Plus size={14} /> 添加
                  </Button>
                </div>

                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className='grid grid-cols-[auto_8rem_1fr_auto] items-start gap-2'
                  >
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='mt-0.5 shrink-0'
                      onClick={() => setPrimary(index)}
                      aria-label='设为主联系方式'
                    >
                      <Star
                        size={16}
                        className={cn(
                          contacts?.[index]?.isPrimary
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground'
                        )}
                      />
                    </Button>
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.channelId`}
                      render={({ field }) => (
                        <FormItem>
                          <SelectDropdown
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            placeholder='渠道'
                            items={contactChannels.map((c) => ({
                              label: c.label,
                              value: c.value,
                            }))}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder='联系方式内容' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='mt-0.5 shrink-0 text-red-500'
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      aria-label='删除联系方式'
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button type='submit' form='influencer-form' disabled={isPending}>
            {isPending ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
