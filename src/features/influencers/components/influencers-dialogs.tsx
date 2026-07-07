import { InfluencersActionDialog } from './influencers-action-dialog'
import { InfluencersDeleteDialog } from './influencers-delete-dialog'
import { useInfluencers } from './influencers-provider'

export function InfluencersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useInfluencers()
  return (
    <>
      <InfluencersActionDialog
        key='influencer-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <InfluencersActionDialog
            key={`influencer-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <InfluencersDeleteDialog
            key={`influencer-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
