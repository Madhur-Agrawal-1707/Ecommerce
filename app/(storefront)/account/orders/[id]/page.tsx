import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Truck, Package, CheckCircle2, Clock } from "lucide-react"

export const metadata = {
  title: "Order Details | Noir & Gold",
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/sign-in?next=/account/orders/${params.id}`)
  }

  // Fetch Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (orderError || !order) {
    notFound()
  }

  // Fetch Items
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)

  // Fetch Timeline
  const { data: timeline } = await supabase
    .from("order_timeline")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false })

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />
      case 'processing': return <Package className="w-5 h-5 text-gold" />
      default: return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return "bg-green-500/10 text-green-500 border-green-500/20"
      case 'shipped': return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case 'cancelled': return "bg-red-500/10 text-red-500 border-red-500/20"
      default: return "bg-gold/10 text-gold border-gold/20"
    }
  }

  return (
    <div className="container py-16 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account/orders" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Order #{order.order_number}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(order.fulfillment_status)}`}>
          {order.fulfillment_status.charAt(0).toUpperCase() + order.fulfillment_status.slice(1)}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Items and Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Items */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="font-serif text-xl font-bold mb-6">Order Items</h2>
            <div className="space-y-6">
              {items?.map((item) => (
                <div key={item.id} className="flex gap-4 pb-6 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    {item.variant_info && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {[item.variant_info.size, item.variant_info.color, item.variant_info.blouse_option].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-medium">₹{Number(item.line_total).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="font-serif text-xl font-bold mb-6">Delivery Updates</h2>
            
            {order.tracking_number && (
              <div className="mb-6 p-4 bg-background/50 rounded-md border border-border">
                <p className="text-sm text-muted-foreground mb-1">Tracking Information</p>
                <p className="font-medium">
                  {order.tracking_carrier ? `${order.tracking_carrier} - ` : ""}
                  {order.tracking_number}
                </p>
              </div>
            )}

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {timeline && timeline.length > 0 ? timeline.map((event: any) => (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-background bg-surface text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                    {getStatusIcon(event.status)}
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg bg-background/50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium capitalize">{event.status}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {event.note && (
                      <p className="text-sm text-muted-foreground">{event.note}</p>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-muted-foreground text-center py-4 relative z-10 bg-surface">
                  No timeline updates yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Summary and Addresses */}
        <div className="space-y-8">
          
          {/* Summary */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="font-serif text-xl font-bold mb-6">Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Discount</span>
                  <span>-₹{Number(order.discount_amount).toLocaleString("en-IN")}</span>
                </div>
              )}
              {Number(order.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{Number(order.tax_amount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{Number(order.shipping_cost) === 0 ? "Free" : `₹${Number(order.shipping_cost).toLocaleString("en-IN")}`}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="font-medium mb-3">Shipping Address</h3>
              <address className="not-italic text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">{order.shipping_address?.fullName || order.email}</p>
                <p>{order.shipping_address?.addressLine1}</p>
                {order.shipping_address?.addressLine2 && <p>{order.shipping_address?.addressLine2}</p>}
                <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}</p>
                <p>{order.shipping_address?.country}</p>
                <p className="mt-2 text-foreground">{order.shipping_address?.phone}</p>
              </address>
            </div>
            
            {order.billing_address && (
              <div className="border-t border-border pt-6">
                <h3 className="font-medium mb-3">Billing Address</h3>
                <address className="not-italic text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">{order.billing_address?.fullName || order.email}</p>
                  <p>{order.billing_address?.addressLine1}</p>
                  {order.billing_address?.addressLine2 && <p>{order.billing_address?.addressLine2}</p>}
                  <p>{order.billing_address?.city}, {order.billing_address?.state} {order.billing_address?.zip}</p>
                  <p>{order.billing_address?.country}</p>
                </address>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
