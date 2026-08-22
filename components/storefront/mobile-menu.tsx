"use client"

import * as React from "react"
import Link from "next/link"
import { X, Heart, User, ShoppingBag } from "lucide-react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

import { useCart } from "@/context/cart-context"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: { href: string; label: string }[]
}

export function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  const { itemCount, openCart } = useCart()
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const linksRef = React.useRef<HTMLUListElement>(null)
  const tlRef = React.useRef<gsap.core.Timeline | null>(null)

  // Build timeline once — play/reverse to open/close
  useGSAP(
    () => {
      if (!overlayRef.current || !linksRef.current) return

      const items = linksRef.current.querySelectorAll("li")

      tlRef.current = gsap
        .timeline({ paused: true })
        .to(overlayRef.current, {
          autoAlpha: 1,
          duration: 0.25,
          ease: "power2.out",
        })
        .from(
          items,
          {
            x: -24,
            opacity: 0,
            stagger: 0.06,
            duration: 0.35,
            ease: "power3.out",
          },
          "-=0.1"
        )
    },
    { scope: overlayRef }
  )

  React.useEffect(() => {
    if (isOpen) {
      tlRef.current?.play()
      // Focus trap: move focus into the dialog
      overlayRef.current?.focus()
    } else {
      tlRef.current?.reverse()
    }
  }, [isOpen])

  // Keyboard: Escape closes
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  // Prevent body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-background outline-none"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      {/* Top bar */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-border">
        <Link
          href="/"
          onClick={onClose}
          className="font-serif text-xl font-bold text-foreground"
        >
          Noir <span className="text-gold">&</span> Gold
        </Link>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-6 py-8">
        <ul ref={linksRef} className="space-y-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className={`block py-3 text-2xl font-serif tracking-wide border-b border-border/40 transition-colors hover:text-gold ${
                  label === "Sale" ? "text-gold" : "text-foreground"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border px-6 py-6 flex items-center gap-4">
        <Link
          href="/account"
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <User className="h-4 w-4" /> Account
        </Link>
        <Link
          href="/account/wishlist"
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Heart className="h-4 w-4" /> Wishlist
        </Link>
        <button
          onClick={() => { onClose(); openCart() }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          Cart
          {itemCount > 0 && (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
