import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Razorpay from "razorpay"

// Admin / Cron endpoint so we use Service Role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Verify authorization (CRON_SECRET or Admin token)
    const authHeader = req.headers.get("authorization")
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    // Allow if CRON_SECRET matches. In a real app, also verify if caller is an admin user.
    if (!isCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Calculate the threshold (24 hours ago)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // 3. Find eligible orders for refund
    const { data: eligibleOrders, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, razorpay_payment_id, total")
      .eq("fulfillment_status", "cancelled")
      .eq("payment_status", "paid")
      .eq("hold_refund", false)
      .lte("cancelled_at", twentyFourHoursAgo)

    if (fetchError) {
      throw new Error(`Failed to fetch eligible orders: ${fetchError.message}`)
    }

    if (!eligibleOrders || eligibleOrders.length === 0) {
      return NextResponse.json({ status: "ok", message: "No refunds to process." })
    }

    // 4. Process refunds via Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    })

    const results = []

    for (const order of eligibleOrders) {
      try {
        if (!order.razorpay_payment_id) {
          throw new Error("Missing razorpay_payment_id")
        }

        // Razorpay expects amount in paise
        const refundAmount = Math.round(Number(order.total) * 100)

        const refundResponse = await razorpay.payments.refund(order.razorpay_payment_id, {
          amount: refundAmount,
          speed: "normal", // standard speed
        })

        // 5. Update Order Status
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "refunded",
            updated_at: new Date().toISOString()
          })
          .eq("id", order.id)

        // Log to timeline
        await supabaseAdmin
          .from("order_timeline")
          .insert({
            order_id: order.id,
            status: "cancelled", // We reuse cancelled or maybe create 'refunded' timeline type
            note: `Automated refund of ₹${order.total} processed via Razorpay (Refund ID: ${refundResponse.id})`
          })

        results.push({ orderId: order.id, status: "success", refundId: refundResponse.id })

      } catch (err: any) {
        console.error(`Failed to refund order ${order.id}:`, err)
        results.push({ orderId: order.id, status: "failed", error: err.message })
        
        // Log failure to timeline
        await supabaseAdmin
          .from("order_timeline")
          .insert({
            order_id: order.id,
            status: "cancelled",
            note: `Automated refund failed: ${err.message}`
          })
      }
    }

    return NextResponse.json({ status: "ok", processed: results })

  } catch (error: any) {
    console.error("[PROCESS_REFUNDS_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
