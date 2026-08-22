import { Metadata } from "next"
import { ProductForm } from "@/components/admin/product-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Product | Admin",
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .order("name")

  // Fetch product with relations
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*),
      options:product_options(*),
      variants:product_variants(*)
    `)
    .eq("id", params.id)
    .single()

  if (!product) {
    notFound()
  }

  // Also fetch option values for options
  if (product.options && product.options.length > 0) {
    const { data: values } = await supabase
      .from("product_option_values")
      .select("*")
      .in("option_id", product.options.map((o: any) => o.id))
      
    if (values) {
      product.options = product.options.map((o: any) => ({
        ...o,
        values: values.filter(v => v.option_id === o.id).map(v => v.value)
      }))
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update inventory, pricing, or media for this product.
        </p>
      </div>

      <ProductForm 
        categories={categories || []} 
        initialData={product} 
      />
    </div>
  )
}
