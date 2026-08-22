"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useRouter, usePathname } from "next/navigation"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ProductCardProps {
  id: string
  title: string
  slug: string
  price: number
  salePrice?: number | null
  imageMain: string
  imageLifestyle?: string
  isNew?: boolean
  stockQuantity?: number
  className?: string
  onAddToCart?: (id: string, e: React.MouseEvent) => void
}

export function ProductCard({
  id,
  title,
  slug,
  price,
  salePrice,
  imageMain,
  imageLifestyle,
  isNew,
  stockQuantity = 10,
  className,
  onAddToCart,
}: ProductCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const imgMainRef = React.useRef<HTMLImageElement>(null)
  const imgLifeRef = React.useRef<HTMLImageElement>(null)
  const quickAddRef = React.useRef<HTMLDivElement>(null)
  const hoverTl = React.useRef<gsap.core.Timeline>()
  const badgeRef = React.useRef<HTMLDivElement>(null)
  const heartRef = React.useRef<SVGSVGElement>(null)

  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [isWishlisted, setIsWishlisted] = React.useState(false)

  useGSAP(
    () => {
      // Hover Timeline
      hoverTl.current = gsap
        .timeline({ paused: true })
        .to(imgMainRef.current, { scale: 1.05, duration: 0.5, ease: "power2.out" }, 0)
      
      if (imageLifestyle) {
        hoverTl.current.to(imgLifeRef.current, { opacity: 1, duration: 0.4 }, 0)
      }

      hoverTl.current.fromTo(
        quickAddRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
        0.1
      )

      // New Badge Pulse
      if (isNew && badgeRef.current) {
        gsap.to(badgeRef.current, {
          scale: 1.05,
          duration: 1,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play pause resume pause",
          },
        })
      }
    },
    { scope: containerRef }
  )

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const willBeWishlisted = !isWishlisted
    setIsWishlisted(willBeWishlisted)

    gsap.fromTo(
      heartRef.current,
      { scale: 0.8 },
      {
        scale: 1,
        duration: 0.4,
        ease: "back.out(2)",
      }
    )
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      router.push(`/auth/sign-in?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (onAddToCart) {
      onAddToCart(id, e)
    }
  }

  return (
    <Link href={`/products/${slug}`} className={cn("group block", className)}>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-md bg-surface shadow-surface bg-fabric"
        onMouseEnter={() => hoverTl.current?.play()}
        onMouseLeave={() => hoverTl.current?.reverse()}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/20">
          <Image
            ref={imgMainRef}
            src={imageMain || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {imageLifestyle && (
            <Image
              ref={imgLifeRef}
              src={imageLifestyle}
              alt={`${title} lifestyle`}
              fill
              className="object-cover opacity-0"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {isNew && (
              <div ref={badgeRef}>
                <Badge variant="default" className="px-2 py-0.5 text-[10px] uppercase">
                  New
                </Badge>
              </div>
            )}
            {salePrice && (
              <Badge variant="destructive" className="px-2 py-0.5 text-[10px] uppercase">
                Sale
              </Badge>
            )}
            {stockQuantity === 0 && (
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Heart */}
          <button
            onClick={handleWishlistClick}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/50 backdrop-blur transition-colors hover:bg-background/80"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              ref={heartRef}
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? "fill-primary text-primary" : "text-foreground"
              )}
            />
          </button>

          {/* Quick Add */}
          <div className="absolute bottom-4 left-0 w-full px-4" ref={quickAddRef} style={{ opacity: 0 }}>
            <Button
              className="w-full shadow-xl"
              variant="default"
              onClick={handleQuickAdd}
              disabled={stockQuantity === 0}
            >
              {stockQuantity === 0 ? "Out of Stock" : "Quick Add"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <h3 className="font-serif text-base tracking-tight text-foreground line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          {salePrice ? (
            <>
              <span className="font-semibold text-primary">₹{salePrice.toLocaleString('en-IN')}</span>
              <span className="text-muted-foreground line-through">₹{price.toLocaleString('en-IN')}</span>
            </>
          ) : (
            <span className="text-foreground">₹{price.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
