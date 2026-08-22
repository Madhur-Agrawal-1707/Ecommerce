"use client"

import * as React from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  stagger?: number
}

export function ScrollReveal({ children, stagger = 0.08, className, ...props }: ScrollRevealProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current) return
      const childrenElements = containerRef.current.children
      
      gsap.from(childrenElements, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
        stagger,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          once: true,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className={cn(className)} {...props}>
      {children}
    </div>
  )
}
