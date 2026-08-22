"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface HeroSlide {
  id: string
  image_url: string
  heading: string | null
  subheading: string | null
  cta_text: string | null
  cta_link: string | null
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const headingRefs = React.useRef<(HTMLHeadingElement | null)[]>([])
  
  React.useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  useGSAP(
    () => {
      const heading = headingRefs.current[activeIndex]
      if (!heading) return

      // Simple word split for animation since SplitText requires Club GreenSock
      const words = heading.querySelectorAll(".word")
      
      gsap.fromTo(
        words,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      )
    },
    { dependencies: [activeIndex], scope: containerRef }
  )

  if (!slides.length) return null

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[60vh] md:min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-black"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          )}
        >
          <Image
            src={slide.image_url}
            alt={slide.heading || "Hero slide"}
            fill
            className="object-cover opacity-60"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pt-20">
            {slide.subheading && (
              <p className="mb-6 text-sm font-medium tracking-widest text-gold uppercase">
                {slide.subheading}
              </p>
            )}
            
            {slide.heading && (
              <h2
                ref={(el) => { headingRefs.current[index] = el }}
                className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
              >
                {slide.heading.split(" ").map((word, i) => (
                  <span key={i} className="word inline-block mr-[0.25em]">
                    {word}
                  </span>
                ))}
              </h2>
            )}

            {slide.cta_text && slide.cta_link && (
              <div className="mt-10">
                <Button asChild className="bg-gold text-black hover:bg-gold-bright transition-all active:scale-95 shadow-emboss">
                  <Link href={slide.cta_link}>
                    {slide.cta_text} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Progress Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 z-20 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="group p-2"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex ? "w-8 bg-gold" : "w-1.5 bg-white/30 group-hover:bg-white/50"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
