import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { OrderTimeline } from "@/components/admin/order-timeline";
import { PrintOrderButton } from "@/components/admin/print-order-button";
import { RefundHoldToggle } from "@/components/admin/refund-hold-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  
  // Fetch order details
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch timeline separately to sort it
  const { data: timeline } = await supabase
    .from("order_timeline")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .eq("order_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order {order.order_number}</h1>
            <p className="text-muted-foreground">
              Placed on {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <PrintOrderButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.title}</p>
                        {item.variant_info && (
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            {Object.entries(item.variant_info).map(([k, v]) => (
                              <div key={k} className="capitalize">
                                {k.replace(/_/g, " ")}: {String(v)}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">₹{item.unit_price}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.line_total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end mt-6">
                <div className="w-64 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping ({order.shipping_method})</span>
                    <span>₹{order.shipping_cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{order.tax_amount}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                      <span>-₹{order.discount_amount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <OrderTimeline orderId={order.id} currentStatus={order.fulfillment_status} timeline={timeline || []} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{order.shipping_address?.full_name || "Guest User"}</p>
                <p className="text-sm text-muted-foreground">
                  {order.user_id ? "Registered Customer" : "Guest Checkout"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Contact Info</p>
                <a href={`mailto:${order.email}`} className="text-sm text-primary hover:underline">
                  {order.email}
                </a>
                {order.shipping_address?.phone && (
                  <p className="text-sm text-muted-foreground">{order.shipping_address.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              {order.shipping_address ? (
                <>
                  <p className="font-medium text-foreground">{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </>
              ) : (
                <p>No shipping address provided.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                  {order.payment_status}
                </Badge>
              </div>
              {order.razorpay_payment_id && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">Razorpay ID</span>
                  <p className="font-mono text-xs bg-muted p-1 rounded">{order.razorpay_payment_id}</p>
                </div>
              )}
              
              <RefundHoldToggle 
                orderId={order.id} 
                initialHoldStatus={order.hold_refund} 
                isCancelled={order.fulfillment_status === "cancelled"} 
                paymentStatus={order.payment_status} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
