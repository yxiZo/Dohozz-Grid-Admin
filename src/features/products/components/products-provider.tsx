import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type ProductRow } from '../data/schema'

type ProductsDialogType = 'add' | 'edit' | 'delete'

type ProductsContextType = {
  open: ProductsDialogType | null
  setOpen: (str: ProductsDialogType | null) => void
  currentRow: ProductRow | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ProductRow | null>>
}

const ProductsContext = React.createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ProductsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProductRow | null>(null)

  return (
    <ProductsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProductsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const ctx = React.useContext(ProductsContext)
  if (!ctx) {
    throw new Error('useProducts has to be used within <ProductsProvider>')
  }
  return ctx
}
