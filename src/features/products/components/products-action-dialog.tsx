'use client'

import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  createProduct,
  getBrands,
  getProductSeries,
  updateProduct,
  type ProductPayload,
} from '@/services/products'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { productStatuses, teamLabel } from '../data/data'
import { type ProductRow } from '../data/schema'

const attrFormSchema = z.object({
  key: z.string().min(1, '请输入属性名。'),
  value: z.string().optional(),
})

const formSchema = z.object({
  sku: z.string().min(1, '请输入 SKU。'),
  productName: z.string().optional(),
  brandId: z.string().min(1, '请选择品牌。'),
  seriesId: z.string().min(1, '请选择系列。'),
  status: z.enum(['1', '0']),
  attrs: z.array(attrFormSchema),
})
type ProductFormValues = z.infer<typeof formSchema>

type Props = {
  currentRow?: ProductRow
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductsActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  })
  const { data: series = [] } = useQuery({
    queryKey: ['product-series'],
    queryFn: getProductSeries,
  })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          sku: currentRow.sku,
          productName: currentRow.productName ?? '',
          brandId: String(currentRow.brandId),
          seriesId: String(currentRow.seriesId),
          status: String(currentRow.status) as '1' | '0',
          attrs: currentRow.attrs.map((a) => ({ key: a.key, value: a.value })),
        }
      : {
          sku: '',
          productName: '',
          brandId: '',
          seriesId: '',
          status: '1',
          attrs: [{ key: '', value: '' }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attrs',
  })

  const selectedBrandId = form.watch('brandId')
  // 系列随品牌级联：仅展示所选品牌下的系列
  const filteredSeries = series.filter(
    (s) => String(s.brandId) === selectedBrandId
  )
  const selectedBrand = brands.find((b) => String(b.id) === selectedBrandId)

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const payload: ProductPayload = {
        sku: values.sku,
        productName: values.productName || undefined,
        brandId: Number(values.brandId),
        seriesId: Number(values.seriesId),
        status: Number(values.status) as ProductRow['status'],
        attrs: values.attrs
          .filter((a) => a.key.trim() !== '')
          .map((a) => ({ key: a.key, value: a.value ?? '' })),
      }
      return isEdit
        ? updateProduct(currentRow.id, payload)
        : createProduct(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(isEdit ? '产品已更新。' : '产品已创建。')
      form.reset()
      onOpenChange(false)
    },
    onError: () => toast.error('保存失败，请检查同品牌下 SKU 是否重复。'),
  })

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
          <DialogTitle>{isEdit ? '编辑产品' : '新增产品'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? '修改产品的品牌归属、系列与规格属性。'
              : '按 品牌 → 系列 → SKU 的层级录入新产品。'}
            完成后点击保存。
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='-mr-4 max-h-[70vh] pr-4'>
          <Form {...form}>
            <form
              id='product-form'
              onSubmit={form.handleSubmit((v) => mutate(v))}
              className='space-y-4 px-0.5'
            >
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='brandId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>品牌</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          // 切换品牌后清空已选系列，避免跨品牌错配
                          form.setValue('seriesId', '')
                        }}
                        placeholder='选择品牌'
                        items={brands.map((b) => ({
                          label: `${b.brandName}（${b.brandCode}）`,
                          value: String(b.id),
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='seriesId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>系列</FormLabel>
                      <SelectDropdown
                        key={selectedBrandId}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder={
                          selectedBrandId ? '选择系列' : '请先选择品牌'
                        }
                        disabled={!selectedBrandId}
                        items={filteredSeries.map((s) => ({
                          label: `${s.seriesName ?? s.seriesCode}（${s.seriesCode}）`,
                          value: String(s.id),
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='sku'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder='品牌内唯一编码' {...field} />
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
                        items={productStatuses.map((s) => ({
                          label: s.label,
                          value: String(s.value),
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='productName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品名称</FormLabel>
                    <FormControl>
                      <Input placeholder='产品完整名称' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 归属团队：由品牌决定，只读展示（对齐 team_id 冗余规则） */}
              <div className='rounded-md border bg-muted/40 px-3 py-2 text-sm'>
                <span className='text-muted-foreground'>归属团队：</span>
                <span className='font-medium'>
                  {selectedBrand ? teamLabel(selectedBrand.teamId) : '选择品牌后自动带出'}
                </span>
              </div>

              {/* 扩展属性（对齐 products.ext JSON） */}
              <div className='space-y-3 rounded-lg border p-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium'>规格属性</p>
                    <p className='text-xs text-muted-foreground'>
                      以键值对形式存入 ext（如 颜色 / 规格 / 净含量）。
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => append({ key: '', value: '' })}
                  >
                    <Plus size={14} /> 添加
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className='text-xs text-muted-foreground'>暂无属性。</p>
                )}

                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className='grid grid-cols-[10rem_1fr_auto] items-start gap-2'
                  >
                    <FormField
                      control={form.control}
                      name={`attrs.${index}.key`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder='属性名' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`attrs.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder='属性值' {...field} />
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
                      aria-label='删除属性'
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
          <Button type='submit' form='product-form' disabled={isPending}>
            {isPending ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
