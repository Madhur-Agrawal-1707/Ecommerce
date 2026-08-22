import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json()

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
    }

    const supabase = createClient()

    // Find the coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    if (!coupon.is_active) {
      return NextResponse.json({ error: "This coupon is inactive" }, { status: 400 })
    }

    const now = new Date()
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ error: "This coupon is not yet valid" }, { status: 400 })
    }
    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 })
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 })
    }

    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${coupon.min_order_amount} required` },
        { status: 400 }
      )
    }

    // Return the discount details
    return NextResponse.json({
      valid: true,
      type: coupon.type,
      value: coupon.value,
      code: coupon.code,
    })
  } catch (error: any) {
    console.error("[VALIDATE_COUPON]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
