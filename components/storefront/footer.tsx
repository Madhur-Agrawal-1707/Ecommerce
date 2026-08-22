import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

// ─── Newsletter form (client island) ────────────────────────────────────────
import { NewsletterForm } from "./newsletter-form"

const DEFAULT_SHOP_LINKS = [
  { href: "/sarees", label: "Sarees" },
  { href: "/suits", label: "Suits" },
  { href: "/coord-sets", label: "Co-ord Sets" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/sale", label: "Sale" },
]

const HELP_LINKS = [
  { href: "/size-guide", label: "Size Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/returns-policy", label: "Returns" },
  { href: "/track-order", label: "Track Order" },
]

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
]

export async function Footer({ categoryLinks }: { categoryLinks?: { href: string; label: string }[] } = {}) {
  // Attempt to load social links from site_settings; fall back to empty
  let socials = { instagram: "", facebook: "", youtube: "" }
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from("site_settings")
      .select("social_instagram, social_facebook, social_youtube")
      .single()
    if (data) {
      socials = {
        instagram: data.social_instagram ?? "",
        facebook: data.social_facebook ?? "",
        youtube: data.social_youtube ?? "",
      }
    }
  } catch {
    // Table doesn't exist yet — silently ignore
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface mt-16">
      {/* Main grid */}
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">

          {/* Brand column */}
          <div className="xl:col-span-2 space-y-5">
            <Link href="/" className="inline-block font-serif text-2xl font-bold text-foreground">
              Noir <span className="text-gold">&</span> Gold
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Handcrafted Indian ethnic wear — Banarasi, Kanjivaram, Chanderi and more.
              Celebrating the artisans who weave stories in silk and thread.
            </p>

            {/* Social — inline SVG (brand icons removed from lucide-react v1.x) */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              {(socials.instagram || true) && (
                <a
                  href={socials.instagram || "#"}
                  target={socials.instagram ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={`transition-colors ${socials.instagram ? "text-muted-foreground hover:text-gold" : "text-muted-foreground/30 pointer-events-none"}`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              )}
              {/* Facebook */}
              {(socials.facebook || true) && (
                <a
                  href={socials.facebook || "#"}
                  target={socials.facebook ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className={`transition-colors ${socials.facebook ? "text-muted-foreground hover:text-gold" : "text-muted-foreground/30 pointer-events-none"}`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {/* YouTube */}
              {(socials.youtube || true) && (
                <a
                  href={socials.youtube || "#"}
                  target={socials.youtube ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className={`transition-colors ${socials.youtube ? "text-muted-foreground hover:text-gold" : "text-muted-foreground/30 pointer-events-none"}`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>


            {/* Contact */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold/60 shrink-0" />
                <span>hello@noirandgold.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold/60 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold/60 shrink-0 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">Shop</h3>
            <ul className="space-y-2">
              {(categoryLinks ? [
                ...categoryLinks,
                { href: "/products?sort=newest", label: "New Arrivals" },
                { href: "/products?sale=true", label: "Sale" }
              ] : DEFAULT_SHOP_LINKS).map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">Help</h3>
            <ul className="space-y-2">
              {HELP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">Company</h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <h3 className="font-serif text-lg text-foreground mb-1">Stay in the loop</h3>
              <p className="text-sm text-muted-foreground">
                New arrivals, exclusive offers, and styling notes — delivered with care.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-4">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} Noir & Gold. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {/* Payment method icons — text-based for now, replace with SVG sprites in Phase 10 */}
            <span className="px-2 py-0.5 border border-border rounded text-[10px] tracking-wide">VISA</span>
            <span className="px-2 py-0.5 border border-border rounded text-[10px] tracking-wide">MC</span>
            <span className="px-2 py-0.5 border border-border rounded text-[10px] tracking-wide">UPI</span>
            <span className="px-2 py-0.5 border border-border rounded text-[10px] tracking-wide">COD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
