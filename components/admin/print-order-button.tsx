"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Link from "next/link";

export function PrintOrderButton({ orderId }: { orderId: string }) {
  return (
    <Button variant="outline" asChild className="print:hidden">
      <Link href={`/admin/orders/${orderId}/print`} target="_blank">
        <Printer className="mr-2 h-4 w-4" />
        Print Invoice
      </Link>
    </Button>
  );
}
