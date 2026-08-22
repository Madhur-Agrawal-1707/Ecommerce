import { CouponForm } from "@/components/admin/coupon-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "New Coupon | Admin Dashboard",
};

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Coupon</h1>
          <p className="text-muted-foreground">Add a new discount code.</p>
        </div>
      </div>

      <div className="bg-card border rounded-md p-6">
        <CouponForm />
      </div>
    </div>
  );
}
