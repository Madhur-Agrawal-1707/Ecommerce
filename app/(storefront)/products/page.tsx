import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import Link from "next/link"
import { ProductCard } from "@/components/storefront/product-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { FilterSidebar } from "./filter-sidebar"
import { MobileFilterDrawer } from "./mobile-filter-drawer"

export const metadata: Metadata = {
  title: "Shop Collection | Noir & Gold",
  description: "Explore our complete collection of sarees and suits.",
}

export const revalidate = 0 // Dynamic page due to search params

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  
  // Build query
  let query = supabase
    .from("products")
    .select(`*, product_images(image_url, image_type)`)
    .eq("status", "active")

  // Apply filters
  if (searchParams.category) {
    // Need to resolve category slug to ID first in a real app, 
    // or if we have category slug on the product, we could use that.
    // Assuming we fetch the category first:
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", searchParams.category as string)
      .single()
      
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }
  
  if (searchParams.fabric) {
    query = query.eq("fabric", searchParams.fabric as string)
  }
  
  // Apply sorting
  const sort = searchParams.sort as string || "newest"
  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const { data: products } = await query

  return (
    <div className="container py-10 flex flex-col md:flex-row gap-8 bg-background min-h-screen">
      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <FilterSidebar />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-3xl text-foreground">
              {searchParams.category ? (searchParams.category as string).replace("-", " ") : "All Collection"}
            </h1>
            <div className="text-sm text-muted-foreground sm:hidden">
              {products?.length || 0} Products
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <MobileFilterDrawer />
            <div className="text-sm text-muted-foreground hidden sm:block">
              {products?.length || 0} Products
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const mainImg = product.product_images?.find((img: any) => img.image_type === 'front') || product.product_images?.[0]
              const lifeImg = product.product_images?.find((img: any) => img.image_type === 'model') || product.product_images?.[1]
              
              return (
                <ScrollReveal key={product.id}>
                  <ProductCard
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
                </ScrollReveal>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}
