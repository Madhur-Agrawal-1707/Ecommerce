"use client"

import * as React from "react"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart()

  return (
    <div className="container py-16 min-h-[60vh]">
      <h1 className="font-serif text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-6">Your cart is currently empty.</p>
          <Button asChild className="bg-gold text-black hover:bg-gold-bright">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {items.map((item) => (
              <div key={`${item.id}-${item.variantId || ""}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-4 border-b border-border/50">
                
                {/* Product Info */}
                <div className="col-span-1 md:col-span-6 flex gap-4">
                  <div className="shrink-0 w-24 h-32 bg-surface rounded-md overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link href={`/products/${item.slug}`} className="font-medium hover:text-gold transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    {(item.size || item.color) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-2 md:hidden">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-1 md:col-span-3 flex justify-between md:justify-center items-center mt-4 md:mt-0">
                  <span className="text-sm text-muted-foreground md:hidden">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                      className="w-8 h-8 flex items-center justify-center rounded border border-border hover:border-gold transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                      className="w-8 h-8 flex items-center justify-center rounded border border-border hover:border-gold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total & Remove */}
                <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center mt-4 md:mt-0">
                  <span className="font-semibold hidden md:block">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => removeItem(item.id, item.variantId)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors ml-4"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-serif font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground text-right">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="text-muted-foreground text-right">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Estimated Total</span>
                  <span className="font-bold text-lg">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button asChild className="w-full bg-gold text-black hover:bg-gold-bright h-12 text-base">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
