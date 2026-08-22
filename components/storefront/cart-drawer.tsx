"use client"

import * as React from "react"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } =
    useCart()

  const overlayRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const tlRef = React.useRef<gsap.core.Timeline | null>(null)

  // Build timeline once — never re-create per open/close
  useGSAP(
    () => {
      if (!overlayRef.current || !panelRef.current) return

      tlRef.current = gsap
        .timeline({ paused: true })
        .to(overlayRef.current, {
          autoAlpha: 1,
          duration: 0.2,
          ease: "power2.out",
        })
        .to(
          panelRef.current,
          {
            xPercent: 0,
            duration: 0.35,
            ease: "power3.out",
          },
          0 // start at same time as backdrop
        )
    },
    { scope: overlayRef }
  )

  React.useEffect(() => {
    if (isOpen) {
      tlRef.current?.play()
    } else {
      tlRef.current?.reverse()
    }
  }, [isOpen])

  // Keyboard: Escape closes
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeCart()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, closeCart])

  // Prevent body scroll while drawer is open
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50"
      style={{ visibility: "hidden", opacity: 0 }}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface border-l border-border shadow-2xl"
        style={{ transform: "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Your Cart
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">Your cart is empty.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={closeCart}
                asChild
              >
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.id}-${item.variantId ?? ""}`}
                  className="flex gap-4 py-3 border-b border-border/40 last:border-0"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-16 rounded-md object-cover bg-surface"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-foreground hover:text-gold transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {(item.size || item.color) && (
                      <p className="text-xs text-muted-foreground">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1, item.variantId)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-gold hover:text-foreground transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1, item.variantId)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-gold hover:text-foreground transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price + remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        <button
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id, item.variantId)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full bg-gold text-black hover:bg-gold-bright font-semibold" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  Checkout
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/cart" onClick={closeCart}>
                  View Cart
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
