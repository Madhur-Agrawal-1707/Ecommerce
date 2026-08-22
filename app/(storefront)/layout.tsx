import * as React from "react"
import { Toaster } from "sonner"
import { AnnouncementBar } from "@/components/storefront/announcement-bar"
import { Header } from "@/components/storefront/header"
import { Footer } from "@/components/storefront/footer"
import { CartDrawer } from "@/components/storefront/cart-drawer"
import { createClient } from "@/lib/supabase/server"

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: categories } = await supabase.from("categories").select("name, slug").order("sort_order")

  const categoryLinks = (categories || []).map((c: any) => ({
    href: `/products?category=${c.slug}`,
    label: c.name
  }))

  const navLinks = [
    ...categoryLinks,
    { href: "/products?sort=newest", label: "New Arrivals" },
    { href: "/products?sale=true", label: "Sale" },
    { href: "/about", label: "About" },
  ]

  return (
    <>
      <AnnouncementBar />
      <Header navLinks={navLinks} />
      <main className="flex-1 min-h-[60vh]">{children}</main>
      <Footer categoryLinks={categoryLinks} />
      {/* Cart drawer — rendered at top level so it overlays everything */}
      <CartDrawer />
      {/* Sonner toast container — restyled per design.md (dark card, gold border) */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-surface border border-gold/20 text-foreground shadow-xl rounded-lg",
            title: "text-foreground text-sm font-medium",
            description: "text-muted-foreground text-xs",
            success: "border-l-4 border-l-gold",
            error: "border-l-4 border-l-destructive",
            info: "border-l-4 border-l-gold/50",
          },
        }}
      />
    </>
  )
}
