import { Metadata } from "next"
import { ProductForm } from "@/components/admin/product-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "New Product | Admin",
}

export default async function NewProductPage() {
  const supabase = createClient()
  
  // Fetch categories for the selector
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .order("name")

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new product in your catalog.
        </p>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  )
}
