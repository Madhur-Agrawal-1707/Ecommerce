import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { AdminNotes } from "./admin-notes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: customer, error } = await supabase
    .from("profiles")
    .select(`
      *,
      orders (*),
      addresses (*)
    `)
    .eq("id", params.id)
    .single();

  if (error || !customer) {
    notFound();
  }

  // Calculate LTV
  const validOrders = customer.orders?.filter((o: any) => o.fulfillment_status !== "cancelled") || [];
  const totalSpent = validOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const ltvFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(totalSpent);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {customer.full_name || "Guest Customer"}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4" /> {customer.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Lifetime Value</span>
                <span className="font-medium text-primary">{ltvFormatted}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-medium">{validOrders.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </span>
                <span className="font-medium">{customer.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joined
                </span>
                <span className="font-medium">
                  {format(new Date(customer.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>Only visible to admins</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Note: 'admin_notes' needs to exist in the DB schema */}
              <AdminNotes customerId={customer.id} initialNotes={customer.admin_notes || ""} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.addresses?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No addresses saved.</p>
              ) : (
                customer.addresses?.map((address: any) => (
                  <div key={address.id} className="text-sm border rounded-md p-3 relative">
                    {address.is_default && (
                      <Badge variant="outline" className="absolute top-3 right-3 text-[10px] h-5">
                        Default
                      </Badge>
                    )}
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> {address.full_name}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {address.address_line1}
                      {address.address_line2 ? `, ${address.address_line2}` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.state} {address.zip}
                    </p>
                    <p className="text-muted-foreground">{address.country}</p>
                    {address.phone && <p className="text-muted-foreground mt-1 text-xs">Phone: {address.phone}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.orders?.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center">No orders placed yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                            {order.order_number}
                          </Link>
                        </TableCell>
                        <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
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
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(order.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
