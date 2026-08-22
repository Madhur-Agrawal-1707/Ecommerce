import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Package, Mail } from "lucide-react"

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: { order_id?: string }
}) {
  const orderId = searchParams.order_id

  if (!orderId) {
    redirect("/")
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Fetch order details
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("user_id", user.id) // Security check
    .single()

  if (!order) {
    redirect("/")
  }

  return (
    <div className="container py-20 min-h-[70vh] flex flex-col items-center justify-center">
      <div className="max-w-xl w-full text-center animate-in zoom-in duration-500 fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        
        <h1 className="font-serif text-4xl font-bold mb-4">Thank you for your order!</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Your order <span className="font-semibold text-foreground">{order.order_number}</span> has been placed successfully.
        </p>

        <div className="bg-surface border border-border rounded-lg p-8 text-left mb-8 space-y-6">
          <div className="flex items-start gap-4 pb-6 border-b border-border">
            <Mail className="w-6 h-6 text-gold shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Order Confirmation</h3>
              <p className="text-sm text-muted-foreground">We've sent a confirmation email to <span className="font-medium text-foreground">{order.email}</span> with your order details.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <Package className="w-6 h-6 text-gold shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Fulfillment Status</h3>
              <p className="text-sm text-muted-foreground">We are currently processing your order. You'll receive another email when it ships.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/account">View Order Details</Link>
          </Button>
          <Button asChild className="bg-gold text-black hover:bg-gold-bright">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
