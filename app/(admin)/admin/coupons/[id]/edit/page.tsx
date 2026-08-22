import { CouponForm } from "@/components/admin/coupon-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Coupon | Admin Dashboard",
};

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !coupon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Coupon</h1>
          <p className="text-muted-foreground">Update settings for {coupon.code}.</p>
        </div>
      </div>

      <div className="bg-card border rounded-md p-6">
        <CouponForm initialData={coupon} />
      </div>
    </div>
  );
}
