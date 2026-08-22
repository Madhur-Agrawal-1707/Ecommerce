"use client"

import * as React from "react"
import Image from "next/image"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

export function ImageGallery({ images, title }: { images: any[], title: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const mainImageRef = React.useRef<HTMLDivElement>(null)
  
  const activeImage = images[activeIndex]?.image_url || "/placeholder.svg"
  
  // Crossfade animation
  const { contextSafe } = useGSAP({ scope: mainImageRef })
  
  const handleThumbnailClick = contextSafe((index: number) => {
    if (index === activeIndex) return
    
    const imgEl = mainImageRef.current?.querySelector('img')
    if (imgEl) {
      gsap.to(imgEl, {
        opacity: 0,
        duration: 0.15,
        onComplete: () => {
          setActiveIndex(index)
          gsap.to(imgEl, { opacity: 1, duration: 0.15 })
        }
      })
    } else {
      setActiveIndex(index)
    }
  })

  // Hover zoom effect
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({})
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)"
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)"
    })
  }

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-surface overflow-hidden rounded-md relative">
        <Image src="/placeholder.svg" alt={title} fill className="object-cover" />
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0">
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => handleThumbnailClick(idx)}
            className={cn(
              "relative w-16 h-20 md:w-20 md:h-28 rounded overflow-hidden shrink-0 transition-all border-2",
              activeIndex === idx ? "border-gold opacity-100" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={img.image_url || "/placeholder.svg"}
              alt={`${title} - Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>
      
      {/* Main Image */}
      <div 
        ref={mainImageRef}
        className="relative aspect-[3/4] w-full bg-surface overflow-hidden rounded-md cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          className="object-cover transition-transform duration-200 ease-out"
          style={zoomStyle}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  )
}
