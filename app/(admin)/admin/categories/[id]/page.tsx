import { CategoryForm } from "@/components/admin/category-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">Modify category details.</p>
        </div>
      </div>
      <CategoryForm initialData={category} />
    </div>
  );
}
