import { type ColDef } from 'ag-grid-community'
import { type Creator, type CreatorStage } from '../data/data'
import { outreachColumns } from './columns.outreach'
import { sampleColumns } from './columns.samples'
import { videoColumns } from './columns.videos'

export const columnsByStage: Record<CreatorStage, ColDef<Creator>[]> = {
  outreach: outreachColumns,
  samples: sampleColumns,
  videos: videoColumns,
}
