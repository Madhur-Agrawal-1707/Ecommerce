import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"

import { HeroCarousel } from "@/components/storefront/hero-carousel"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { ProductCard } from "@/components/storefront/product-card"

export const metadata: Metadata = {
  title: "Noir & Gold — Women's Sarees & Suits",
  description:
    "Discover exquisite handcrafted sarees and suits. Banarasi, Kanjivaram, Chanderi and more — delivered across India.",
}

export const revalidate = 60

export default async function HomePage() {
  const supabase = createClient()

  const [
    { data: heroSlides },
    { data: categories },
    { data: newProducts },
    { data: siteSettings },
  ] = await Promise.all([
    supabase.from("hero_slides").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("products")
      .select(`*, product_images(image_url, image_type)`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("site_settings").select("*").single(),
  ])

  const topCategories = categories?.filter((c) => !c.parent_id) || []
  
  return (
    <div className="flex flex-col bg-background">
      <HeroCarousel slides={heroSlides || []} />

      {/* Shop by Category */}
      <section className="py-20">
        <ScrollReveal className="container">
          <h2 className="mb-10 font-serif text-3xl text-foreground text-center">Shop by Category</h2>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x scrollbar-hide px-4 md:px-0 -mx-4 md:mx-0">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative flex-shrink-0 w-48 md:w-64 aspect-[3/4] overflow-hidden rounded-md snap-start shadow-surface"
              >
                <Image
                  src={cat.image_url || "/placeholder.svg"}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="256px"
                />
                <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="font-serif text-xl text-foreground text-center">{cat.name}</h3>
                  <div className="mx-auto mt-2 h-px w-8 bg-gold/50 transition-all group-hover:w-16" />
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-surface bg-fabric shadow-surface">
        <ScrollReveal className="container">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-serif text-3xl text-foreground">New Arrivals</h2>
            <Link href="/products?sort=newest" className="text-sm text-gold hover:text-gold-bright transition-colors flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {newProducts?.map((product) => {
              const mainImg = product.product_images?.find((img: any) => img.image_type === 'front') || product.product_images?.[0]
              const lifeImg = product.product_images?.find((img: any) => img.image_type === 'model') || product.product_images?.[1]
              
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  slug={product.slug}
                  price={product.price}
                  salePrice={product.sale_price}
                  imageMain={mainImg?.image_url || "/placeholder.svg"}
                  imageLifestyle={lifeImg?.image_url}
                  isNew={true}
                  stockQuantity={product.stock_quantity}
                />
              )
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* Fabric Spotlight */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/5 blur-[100px]" />
        <ScrollReveal className="container relative z-10 text-center max-w-3xl">
          <h2 className="font-serif text-4xl mb-6">The Art of Handloom</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Every thread tells a story. Discover our exclusive collection of pure Banarasi silks, 
            handwoven by master artisans using techniques passed down through generations.
          </p>
          <Link
            href="/products?fabric=banarasi"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-8 py-3.5 text-sm font-semibold text-black hover:bg-gold-bright transition-colors shadow-emboss active:scale-95"
          >
            Shop Banarasi Silk <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </section>
    </div>
  )
}
