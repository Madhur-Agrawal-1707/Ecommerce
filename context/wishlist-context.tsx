"use client"

import * as React from "react"
import type { ProductCardProps } from "@/components/storefront/product-card"

export type WishlistItem = Omit<ProductCardProps, "className" | "onAddToCart">

interface WishlistContextValue {
  items: WishlistItem[]
  itemCount: number
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  isWishlisted: (id: string) => boolean
  clearWishlist: () => void
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null)

const STORAGE_KEY = "noir-gold-wishlist"

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistItem[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items, hydrated])

  const addItem = React.useCallback((incoming: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === incoming.id)) return prev
      return [...prev, incoming]
    })
  }, [])

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const isWishlisted = React.useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  )

  const clearWishlist = React.useCallback(() => setItems([]), [])

  const value = React.useMemo<WishlistContextValue>(
    () => ({
      items,
      itemCount: items.length,
      addItem,
      removeItem,
      isWishlisted,
      clearWishlist,
    }),
    [items, addItem, removeItem, isWishlisted, clearWishlist]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist(): WishlistContextValue {
  const ctx = React.useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>")
  return ctx
}
