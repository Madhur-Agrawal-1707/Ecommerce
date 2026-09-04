"use client"

import * as React from "react"
import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { useWishlist } from "@/context/wishlist-context"
import { ProductCard } from "@/components/storefront/product-card"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist()
  const containerRef = React.useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (items.length > 0) {
        gsap.fromTo(".wishlist-item", 
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: "power3.out",
          }
        )
      } else {
        gsap.fromTo(".empty-state", 
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.5)",
          }
        )
      }
    },
    { dependencies: [items.length], scope: containerRef }
  )

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 min-h-[70vh]" ref={containerRef}>
      <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Your Wishlist
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            A curated collection of your favorite pieces. 
            Keep them here until you're ready to make them yours.
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={clearWishlist} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            Clear Wishlist
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-surface/50 border border-border/50">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Heart className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-3">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2 shadow-xl hover:shadow-primary/20 transition-all">
              Discover Arrivals <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
          {items.map((item) => (
            <div key={item.id} className="wishlist-item">
              <ProductCard {...item} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
