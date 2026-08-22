import { createClient } from "@/lib/supabase/server";
import { CategoryTree } from "@/components/admin/category-tree";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CategoriesPage() {
  const supabase = createClient();
  
  // Fetch categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
  }

  // Also we need to know if categories have products to block deletion
  const { data: products } = await supabase
    .from("products")
    .select("category_id");

  const productCounts = products?.reduce((acc, p) => {
    if (p.category_id) {
      acc[p.category_id] = (acc[p.category_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories and hierarchy.</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Tree</CardTitle>
          <CardDescription>
            Drag and drop to reorder categories. Categories with child categories or assigned products cannot be deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryTree 
            initialCategories={categories || []} 
            productCounts={productCounts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
