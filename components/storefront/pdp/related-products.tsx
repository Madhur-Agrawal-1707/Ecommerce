import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/storefront/product-card"

export async function RelatedProducts({ currentProductId, categoryId }: { currentProductId: string, categoryId: string | null }) {
  if (!categoryId) return null

  const supabase = createClient()
  
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(`*, product_images(image_url, image_type)`)
    .eq("category_id", categoryId)
    .eq("status", "active")
    .neq("id", currentProductId)
    .limit(4)

  if (!relatedProducts || relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="mt-24 pt-16 border-t border-border">
      <h2 className="font-serif text-3xl text-foreground mb-8 text-center">Complete the Look</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
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
              stockQuantity={product.stock_quantity}
            />
          )
        })}
      </div>
    </section>
  )
}
