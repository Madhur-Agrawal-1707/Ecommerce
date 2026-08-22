import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ImageGallery } from "@/components/storefront/pdp/image-gallery"
import { ProductInfo } from "@/components/storefront/pdp/product-info"
import { VariantSelector } from "@/components/storefront/pdp/variant-selector"
import { Accordions } from "@/components/storefront/pdp/accordions"
import { RelatedProducts } from "@/components/storefront/pdp/related-products"
import Link from "next/link"

export const revalidate = 60

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { slug } = params

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (id, name, slug, parent_id),
      product_images (*),
      product_variants (*)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (error || !product) {
    notFound()
  }

  // Sort images by sort_order
  const sortedImages = (product.product_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
  
  // Sort variants by stock, or price? Actually just pass them
  const variants = product.product_variants || []

  // Mock breadcrumbs logic
  const cat = product.categories

  return (
    <div className="container py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        {cat && (
          <>
            <Link href={`/products?category=${cat.slug}`} className="hover:text-foreground">{cat.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Left: Image Gallery */}
        <div className="md:sticky md:top-24 h-max">
          <ImageGallery images={sortedImages} title={product.title} />
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col space-y-8">
          <ProductInfo product={product} />
          
          <VariantSelector product={product} variants={variants} />
          
          <Accordions product={product} />
        </div>
      </div>

      <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
    </div>
  )
}
