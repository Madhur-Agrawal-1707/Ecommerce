"use client"

import * as React from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ShoppingBag, Minus, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

export function VariantSelector({ product, variants }: { product: any, variants: any[] }) {
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  )
  const [quantity, setQuantity] = React.useState(1)
  const [selectedBlouse, setSelectedBlouse] = React.useState("none")
  const { addItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const selectedVariant = variants.find(v => v.id === selectedVariantId)
  const stock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity
  const isOutOfStock = stock <= 0
  const isSaree = product.category_id && product.categories?.name?.toLowerCase().includes("saree")

  const { contextSafe } = useGSAP({ scope: buttonRef })

  const handleAddToCart = contextSafe((e: React.MouseEvent) => {
    if (isOutOfStock) return

    if (!user) {
      router.push(`/auth/sign-in?next=${encodeURIComponent(pathname || "")}`)
      return
    }

    // Flying cart animation
    const cartIcon = document.getElementById("cart-icon")
    const imgEl = document.querySelector(".group img") as HTMLImageElement

    if (cartIcon && imgEl) {
      const imgRect = imgEl.getBoundingClientRect()
      const cartRect = cartIcon.getBoundingClientRect()

      const clone = imgEl.cloneNode(true) as HTMLImageElement
      Object.assign(clone.style, {
        position: "fixed",
        top: `${imgRect.top}px`,
        left: `${imgRect.left}px`,
        width: `${imgRect.width}px`,
        height: `${imgRect.height}px`,
        zIndex: 9999,
        transition: "none",
        pointerEvents: "none",
        borderRadius: "8px",
        objectFit: "cover"
      })
      document.body.appendChild(clone)

      gsap.to(clone, {
        x: cartRect.left - imgRect.left + 10,
        y: cartRect.top - imgRect.top + 10,
        scale: 0.1,
        opacity: 0.5,
        rotation: 15,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          clone.remove()
          gsap.fromTo(cartIcon, 
            { scale: 1 }, 
            { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: "elastic.out" }
          )
        }
      })
    }

    // Add to cart context
    addItem({
      id: product.id,
      variantId: selectedVariantId || undefined,
      quantity,
      name: product.title,
      slug: product.slug,
      price: selectedVariant?.price || product.sale_price || product.price,
      image: product.product_images?.[0]?.image_url || "/placeholder.svg"
    })
  })

  // Group variants by option values (Assuming we have size and color)
  // For simplicity, we just list them if there are multiple
  
  return (
    <div className="space-y-6">
      {variants.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Variants</label>
          <div className="flex flex-wrap gap-3">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                disabled={v.stock_quantity <= 0}
                className={cn(
                  "px-4 py-2 min-h-[44px] text-sm border rounded-md transition-all flex items-center justify-center",
                  selectedVariantId === v.id 
                    ? "border-gold text-gold bg-gold/10" 
                    : "border-border hover:border-foreground",
                  v.stock_quantity <= 0 && "opacity-50 cursor-not-allowed line-through"
                )}
              >
                {v.sku || "Default"} - ₹{v.price}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSaree && product.blouse_included !== 'none' && (
        <div className="space-y-3">
          <label className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Blouse Stitching</label>
          <div className="flex flex-wrap gap-3">
            {["none", "unstitched", "stitched"].map(opt => (
              <button
                key={opt}
                onClick={() => setSelectedBlouse(opt)}
                className={cn(
                  "px-4 py-2 min-h-[44px] text-sm border rounded-md transition-all capitalize flex items-center justify-center",
                  selectedBlouse === opt 
                    ? "border-gold text-gold bg-gold/10" 
                    : "border-border hover:border-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="flex items-center border border-border rounded-md">
          <button 
            className="p-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface hover:text-gold transition-colors disabled:opacity-50"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium">{quantity}</span>
          <button 
            className="p-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface hover:text-gold transition-colors disabled:opacity-50"
            onClick={() => setQuantity(q => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {stock > 0 ? (stock < 5 ? `Only ${stock} left!` : `In stock`) : "Out of stock"}
        </div>
      </div>

      <Button 
        ref={buttonRef}
        size="lg" 
        className="w-full bg-gold text-black hover:bg-gold-bright"
        disabled={isOutOfStock}
        onClick={handleAddToCart}
      >
        <ShoppingBag className="w-5 h-5 mr-2" />
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  )
}
