"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type CouponRow = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  times_used: number;
  usage_limit: number | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
};

export function CouponList({ data }: { data: CouponRow[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Coupon deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    } finally {
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<CouponRow>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "type",
      header: "Discount",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const value = row.original.value;
        return type === "percentage" ? `${value}% off` : `₹${value} off`;
      },
    },
    {
      accessorKey: "times_used",
      header: "Usage",
      cell: ({ row }) => {
        const used = row.getValue("times_used") as number;
        const limit = row.original.usage_limit;
        return (
          <div className="text-sm">
            {used} {limit ? `/ ${limit}` : "used"}
          </div>
        );
      },
    },
    {
      id: "validity",
      header: "Validity",
      cell: ({ row }) => {
        const from = row.original.valid_from;
        const to = row.original.valid_to;
        if (!from && !to) return <span className="text-muted-foreground">Forever</span>;
        
        return (
          <div className="text-xs">
            {from ? format(new Date(from), "MMM d") : "Always"} -{" "}
            {to ? format(new Date(to), "MMM d, yyyy") : "Forever"}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        const to = row.original.valid_to;
        const isExpired = to ? new Date(to) < new Date() : false;

        if (isExpired) {
          return <Badge variant="secondary">Expired</Badge>;
        }
        return isActive ? (
          <Badge variant="default" className="bg-green-600">Active</Badge>
        ) : (
          <Badge variant="secondary">Disabled</Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/coupons/${coupon.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteId(coupon.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data} searchKey="code" />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  );
}
