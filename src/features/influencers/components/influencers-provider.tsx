import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Influencer } from '../data/schema'

type InfluencersDialogType = 'add' | 'edit' | 'delete'

type InfluencersContextType = {
  open: InfluencersDialogType | null
  setOpen: (str: InfluencersDialogType | null) => void
  currentRow: Influencer | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Influencer | null>>
}

const InfluencersContext = React.createContext<InfluencersContextType | null>(
  null
)

export function InfluencersProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<InfluencersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Influencer | null>(null)

  return (
    <InfluencersContext
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </InfluencersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useInfluencers = () => {
  const ctx = React.useContext(InfluencersContext)
  if (!ctx) {
    throw new Error(
      'useInfluencers has to be used within <InfluencersProvider>'
    )
  }
  return ctx
}
