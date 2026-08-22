"use client"

import * as React from "react"
import Link from "next/link"
import { ShoppingBag, Search, Heart, User, Menu } from "lucide-react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { MobileMenu } from "./mobile-menu"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const DEFAULT_NAV_LINKS = [
  { href: "/sarees", label: "Sarees" },
  { href: "/suits", label: "Suits" },
  { href: "/coord-sets", label: "Co-ord Sets" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/sale", label: "Sale" },
  { href: "/about", label: "About" },
]

export function Header({ navLinks = DEFAULT_NAV_LINKS }: { navLinks?: { href: string; label: string }[] } = {}) {
  const { itemCount, openCart } = useCart()
  const { user, profile } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const headerRef = React.useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!headerRef.current) return

      const borderEl = headerRef.current.querySelector<HTMLElement>("[data-scroll-border]")

      ScrollTrigger.create({
        start: 0,
        end: 80,
        scrub: true,
        onUpdate: (self) => {
          gsap.to(headerRef.current, {
            height: gsap.utils.interpolate(80, 60, self.progress),
            duration: 0,
            overwrite: "auto"
          })
          
          if (borderEl) {
            gsap.to(borderEl, { 
              opacity: self.progress, 
              duration: 0, 
              overwrite: "auto" 
            })
          }
        },
      })
    },
    { scope: headerRef }
  )

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 w-full"
        style={
          {
            "--header-h": "80px",
            height: "var(--header-h)",
            backgroundColor: "hsl(var(--background) / 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          } as React.CSSProperties
        }
      >
        {/* Gold bottom border — invisible until scroll */}
        <div
          data-scroll-border
          className="absolute inset-x-0 bottom-0 h-px bg-gold/30 opacity-0"
        />

        <div className="container h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl font-bold tracking-tight text-foreground hover:text-gold transition-colors"
          >
            Noir <span className="text-gold">&</span> Gold
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Primary navigation">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors relative group",
                  label === "Sale" && "text-gold hover:text-gold-bright"
                )}
              >
                {label}
                {/* Underline hover indicator */}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              aria-label="Search"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hidden sm:flex"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Account */}
            {user ? (
              <Link
                href="/account"
                aria-label="Account"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hidden sm:flex items-center"
              >
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name || user.email} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">
                    {(profile?.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href="/auth/sign-in"
                aria-label="Account"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hidden sm:flex"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Cart */}
            <button
              id="cart-icon"
              aria-label={`Cart (${itemCount} items)`}
              onClick={openCart}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </>
  )
}
