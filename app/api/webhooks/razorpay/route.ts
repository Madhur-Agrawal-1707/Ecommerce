import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// We use service role key for webhooks because they run outside of an authenticated user session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")
    
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
      console.error("[RAZORPAY_WEBHOOK] Webhook secret not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex")

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Handle payment.captured or order.paid
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload.payment.entity
      const razorpayOrderId = payment.order_id
      const paymentId = payment.id

      // Find the order
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("razorpay_payment_id", razorpayOrderId)
        .single()

      if (orderError || !order) {
        console.error(`[RAZORPAY_WEBHOOK] Order not found for Razorpay Order ID: ${razorpayOrderId}`)
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      // Idempotency check
      if (order.payment_status === "paid") {
        console.log(`[RAZORPAY_WEBHOOK] Order ${order.id} is already paid. Ignoring.`)
        return NextResponse.json({ status: "ok" })
      }

      // Update order status
      // We set payment_status to 'paid' which will trigger our stock decrement function
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          fulfillment_status: "processing",
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id)

      if (updateError) {
        throw new Error(`Failed to update order status: ${updateError.message}`)
      }

      // If a coupon was used, increment its usage_count
      if (order.coupon_code) {
        // Run an rpc or a raw update to increment times_used safely
        // Supabase REST API doesn't have an increment operation natively, 
        // so we fetch and update. In high concurrency, RPC is better, but this suffices for now.
        const { data: coupon } = await supabaseAdmin
          .from("coupons")
          .select("times_used")
          .eq("code", order.coupon_code)
          .single()
          
        if (coupon) {
          await supabaseAdmin
            .from("coupons")
            .update({ times_used: (coupon.times_used || 0) + 1 })
            .eq("code", order.coupon_code)
        }
      }

      console.log(`[RAZORPAY_WEBHOOK] Successfully processed payment for order ${order.id}`)
      return NextResponse.json({ status: "ok" })
    }

    return NextResponse.json({ status: "ignored" })
  } catch (error: any) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
