import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { OrderFilters } from "@/components/admin/order-filters";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  
  // Parse filters
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const paymentStatus = typeof searchParams.payment_status === "string" ? searchParams.payment_status : "";
  const fulfillmentStatus = typeof searchParams.fulfillment_status === "string" ? searchParams.fulfillment_status : "";

  let query = supabase
    .from("orders")
    .select("*, order_items(count)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`order_number.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (paymentStatus && paymentStatus !== "all") {
    query = query.eq("payment_status", paymentStatus);
  }
  if (fulfillmentStatus && fulfillmentStatus !== "all") {
    query = query.eq("fulfillment_status", fulfillmentStatus);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <OrderFilters currentFilters={{ search, paymentStatus, fulfillmentStatus }} />

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                    {order.order_number}
                  </Link>
                </TableCell>
                <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.shipping_address?.full_name || "Guest"}</span>
                    <span className="text-xs text-muted-foreground">{order.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {order.order_items?.[0]?.count || 0}
                </TableCell>
                <TableCell className="text-right">₹{order.total}</TableCell>
                <TableCell>
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                    {order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    order.fulfillment_status === "fulfilled" || order.fulfillment_status === "shipped" 
                      ? "default" 
                      : order.fulfillment_status === "cancelled" ? "destructive" : "secondary"
                  }>
                    {order.fulfillment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/orders/${order.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!orders?.length && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
