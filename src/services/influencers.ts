import { api, type ApiResponse } from '@/lib/api'
import type {
  Influencer,
  InfluencerContact,
} from '@/features/influencers/data/schema'

export type InfluencerContactPayload = Omit<InfluencerContact, 'id'> & {
  id?: string
}

export type InfluencerPayload = {
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
  contacts: InfluencerContactPayload[]
}

export async function getInfluencers() {
  const res = await api.get<ApiResponse<Influencer[]>>('/influencers')
  return res.data.data
}

export async function createInfluencer(payload: InfluencerPayload) {
  const res = await api.post<ApiResponse<Influencer>>('/influencers', payload)
  return res.data.data
}

export async function updateInfluencer(id: string, payload: InfluencerPayload) {
  const res = await api.put<ApiResponse<Influencer>>(
    `/influencers/${id}`,
    payload
  )
  return res.data.data
}

export async function deleteInfluencer(id: string) {
  const res = await api.delete<ApiResponse<Influencer>>(`/influencers/${id}`)
  return res.data.data
}
