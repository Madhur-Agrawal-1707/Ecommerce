import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "Products | Admin",
}

export default async function ProductsPage() {
  const supabase = createClient()
  
  // Fetch products with their featured image and category
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (name),
      product_images (image_url)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
  }

  // Format data for table
  const formattedProducts = (products || []).map(p => ({
    ...p,
    category_name: p.categories?.name || "Uncategorized",
    featured_image: p.product_images?.length > 0 ? p.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0].image_url : null
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your store&apos;s inventory, pricing, and variants.
          </p>
        </div>
        <Button asChild className="bg-gold text-black hover:bg-gold-bright">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={formattedProducts} 
        searchKey="title"
      />
    </div>
  )
}
