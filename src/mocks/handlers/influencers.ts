import { http, HttpResponse } from 'msw'
import type {
  Influencer,
  InfluencerContact,
} from '@/features/influencers/data/schema'
import { mockInfluencers } from '../db/influencers'

type ContactBody = Omit<InfluencerContact, 'id'> & { id?: string }

type InfluencerBody = {
  platformId: string
  platformUid: string
  handle?: string
  displayName: string
  avatarUrl?: string
  countryId: number
  countryName: string
  status: Influencer['status']
  source?: Influencer['source']
  followerCountSnapshot: number | null
  remark?: string
  contacts: ContactBody[]
}

// 保证同一达人仅一条主联系方式（对齐 service 层约束）
function normalizeContacts(contacts: ContactBody[]): InfluencerContact[] {
  let primaryAssigned = false
  return contacts.map((c) => {
    const isPrimary = c.isPrimary && !primaryAssigned
    if (isPrimary) primaryAssigned = true
    return {
      id: c.id ?? crypto.randomUUID(),
      channelId: c.channelId,
      value: c.value,
      isPrimary,
      remark: c.remark,
    }
  })
}

export const influencerHandlers = [
  http.get('/api/influencers', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockInfluencers,
    })
  }),

  http.post('/api/influencers', async ({ request }) => {
    const body = (await request.json()) as InfluencerBody
    // 平台内唯一身份校验：platformId + platformUid
    const duplicate = mockInfluencers.find(
      (i) =>
        i.platformId === body.platformId &&
        i.platformUid === body.platformUid
    )
    if (duplicate) {
      return HttpResponse.json(
        { code: 400, message: '该平台下已存在相同 UID 的达人', data: null },
        { status: 400 }
      )
    }
    const now = new Date()
    const influencer: Influencer = {
      id: crypto.randomUUID(),
      platformId: body.platformId,
      platformUid: body.platformUid,
      handle: body.handle,
      displayName: body.displayName,
      avatarUrl: body.avatarUrl,
      countryId: body.countryId,
      countryName: body.countryName,
      status: body.status,
      source: body.source,
      followerCountSnapshot: body.followerCountSnapshot,
      remark: body.remark,
      contacts: normalizeContacts(body.contacts),
      createdAt: now,
      updatedAt: now,
    }
    mockInfluencers.unshift(influencer)
    return HttpResponse.json({ code: 0, message: 'success', data: influencer })
  }),

  http.put('/api/influencers/:id', async ({ params, request }) => {
    const body = (await request.json()) as InfluencerBody
    const influencer = mockInfluencers.find((i) => i.id === params.id)
    if (!influencer) {
      return HttpResponse.json(
        { code: 404, message: '达人不存在', data: null },
        { status: 404 }
      )
    }
    influencer.platformId = body.platformId
    influencer.platformUid = body.platformUid
    influencer.handle = body.handle
    influencer.displayName = body.displayName
    influencer.avatarUrl = body.avatarUrl
    influencer.countryId = body.countryId
    influencer.countryName = body.countryName
    influencer.status = body.status
    influencer.source = body.source
    influencer.followerCountSnapshot = body.followerCountSnapshot
    influencer.remark = body.remark
    influencer.contacts = normalizeContacts(body.contacts)
    influencer.updatedAt = new Date()
    return HttpResponse.json({ code: 0, message: 'success', data: influencer })
  }),

  http.delete('/api/influencers/:id', ({ params }) => {
    const index = mockInfluencers.findIndex((i) => i.id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { code: 404, message: '达人不存在', data: null },
        { status: 404 }
      )
    }
    // 软删除：直接从内存列表移除以模拟 deleted_at 生效后不再返回
    const [removed] = mockInfluencers.splice(index, 1)
    return HttpResponse.json({ code: 0, message: 'success', data: removed })
  }),
]
