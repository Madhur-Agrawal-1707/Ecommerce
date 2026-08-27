import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package } from "lucide-react"

export const metadata = {
  title: "My Orders | Noir & Gold",
}

export default async function OrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in?next=/account/orders")
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
  }

  return (
    <div className="container py-16 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Account
        </Link>
      </div>

      <h1 className="font-serif text-3xl font-bold mb-8">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No orders found</h2>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Button asChild className="bg-gold text-black hover:bg-gold-bright">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="p-4 font-medium text-muted-foreground">Order Number</th>
                  <th className="p-4 font-medium text-muted-foreground">Date</th>
                  <th className="p-4 font-medium text-muted-foreground">Status</th>
                  <th className="p-4 font-medium text-muted-foreground">Total</th>
                  <th className="p-4 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="p-4 font-medium">{order.order_number}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.fulfillment_status === "delivered" ? "bg-green-500/10 text-green-500" :
                        order.fulfillment_status === "cancelled" ? "bg-red-500/10 text-red-500" :
                        "bg-gold/10 text-gold"
                      }`}>
                        {order.fulfillment_status.charAt(0).toUpperCase() + order.fulfillment_status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 font-medium">₹{Number(order.total).toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/account/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
