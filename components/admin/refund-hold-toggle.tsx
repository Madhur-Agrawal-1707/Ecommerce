"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RefundHoldToggleProps {
  orderId: string;
  initialHoldStatus: boolean;
  isCancelled: boolean;
  paymentStatus: string;
}

export function RefundHoldToggle({ orderId, initialHoldStatus, isCancelled, paymentStatus }: RefundHoldToggleProps) {
  const [isHolding, setIsHolding] = useState(initialHoldStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Only relevant for paid orders that are cancelled or might be cancelled
  if (paymentStatus !== "paid" && paymentStatus !== "refunded") {
    return null;
  }

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ hold_refund: checked })
        .eq("id", orderId);

      if (error) throw error;
      
      setIsHolding(checked);
      toast.success(checked ? "Refund held for review." : "Refund hold released.");
      
      // Optionally log to timeline here or via DB triggers
      await supabase.from("order_timeline").insert({
        order_id: orderId,
        status: isCancelled ? "cancelled" : "processing",
        note: checked ? "Admin placed a hold on the automated refund." : "Admin released the hold on the automated refund."
      });

      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update refund hold status.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border mt-4">
      <div className="flex items-center gap-3">
        {isHolding ? (
          <ShieldAlert className="w-5 h-5 text-destructive" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-green-600" />
        )}
        <div className="space-y-0.5">
          <Label htmlFor="hold-refund" className="text-sm font-medium">
            Hold Automated Refund
          </Label>
          <p className="text-xs text-muted-foreground">
            Prevent the 24h cron from automatically refunding this order.
          </p>
        </div>
      </div>
      <Switch
        id="hold-refund"
        checked={isHolding}
        onCheckedChange={handleToggle}
        disabled={isLoading || paymentStatus === "refunded"}
      />
    </div>
  );
}
