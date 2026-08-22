import { RefObject } from "react"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"

// 5.1 Scroll-scrubbed header shrink
export function useHeaderScroll(
  headerRef: RefObject<HTMLElement>,
  borderRef: RefObject<HTMLElement>
) {
  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: 80,
      scrub: true,
      onUpdate: (self) => {
        gsap.to(headerRef.current, {
          height: gsap.utils.interpolate(80, 60, self.progress),
          duration: 0,
        })
        gsap.to(borderRef.current, { opacity: self.progress, duration: 0 })
      },
    })
  }, [headerRef, borderRef])
}

// 5.3 Flying add-to-cart
export function flyToCart(sourceEl: HTMLElement, targetEl: HTMLElement, badgeEl?: HTMLElement) {
  const clone = sourceEl.cloneNode(true) as HTMLElement
  const startRect = sourceEl.getBoundingClientRect()
  const endRect = targetEl.getBoundingClientRect()
  
  Object.assign(clone.style, {
    position: "fixed",
    top: `${startRect.top}px`,
    left: `${startRect.left}px`,
    width: `${startRect.width}px`,
    height: `${startRect.height}px`,
    zIndex: "9999",
  })
  document.body.appendChild(clone)

  const tl = gsap.timeline({ onComplete: () => clone.remove() })
  tl.to(clone, {
    top: endRect.top,
    left: endRect.left,
    width: 24,
    height: 24,
    scale: 0.2,
    rotation: 10,
    opacity: 0.3,
    duration: 0.7,
    ease: "power1.inOut",
  }).to(
    targetEl,
    {
      scale: 1.3,
      duration: 0.2,
      ease: "elastic.out(1, 0.4)",
      yoyo: true,
      repeat: 1,
    },
    "-=0.15"
  )
  
  if (badgeEl) {
    gsap.fromTo(
      badgeEl,
      { scale: 0 },
      { scale: 1, duration: 0.25, ease: "back.out(2)", delay: 0.55 }
    )
  }
}

// 5.6 Scroll reveal wrapper
export function useScrollReveal(
  containerRef: RefObject<HTMLElement>,
  childRefs: RefObject<HTMLElement[]>
) {
  useGSAP(() => {
    if (!containerRef.current || !childRefs.current?.length) return
    
    gsap.from(childRefs.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        once: true,
      },
    })
  }, [containerRef, childRefs])
}

// 5.7 Checkmark path-draw
export function useCheckmarkDraw(pathRef: RefObject<SVGPathElement>) {
  useGSAP(() => {
    const path = pathRef.current
    if (!path) return
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    gsap.to(path, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut", delay: 0.2 })
  }, [pathRef])
}
