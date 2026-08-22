"use client"

import * as React from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CartItem {
  id: string          // product_id (or variant_id when variants exist)
  variantId?: string
  name: string
  slug: string
  price: number       // in INR, final price after sale
  quantity: number
  image: string
  size?: string
  color?: string
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string, variantId?: string) => void
  updateQuantity: (id: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

const STORAGE_KEY = "noir-gold-cart"

function itemKey(id: string, variantId?: string) {
  return variantId ? `${id}::${variantId}` : id
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  // Hydration guard — don't read localStorage until client mount
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // corrupted storage — start fresh
    }
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full or blocked — silently ignore
    }
  }, [items, hydrated])

  const addItem = React.useCallback(
    (incoming: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const qty = incoming.quantity ?? 1
      setItems((prev) => {
        const key = itemKey(incoming.id, incoming.variantId)
        const existing = prev.find(
          (i) => itemKey(i.id, i.variantId) === key
        )
        if (existing) {
          return prev.map((i) =>
            itemKey(i.id, i.variantId) === key
              ? { ...i, quantity: i.quantity + qty }
              : i
          )
        }
        return [...prev, { ...incoming, quantity: qty }]
      })
      setIsOpen(true)
    },
    []
  )

  const removeItem = React.useCallback((id: string, variantId?: string) => {
    const key = itemKey(id, variantId)
    setItems((prev) => prev.filter((i) => itemKey(i.id, i.variantId) !== key))
  }, [])

  const updateQuantity = React.useCallback(
    (id: string, quantity: number, variantId?: string) => {
      if (quantity < 1) {
        removeItem(id, variantId)
        return
      }
      const key = itemKey(id, variantId)
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.id, i.variantId) === key ? { ...i, quantity } : i
        )
      )
    },
    [removeItem]
  )

  const clearCart = React.useCallback(() => setItems([]), [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, isOpen]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}
