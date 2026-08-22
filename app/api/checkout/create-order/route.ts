import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Razorpay from "razorpay"

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { items, shippingAddress, billingAddress, couponCode, shippingMethod, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // 1. Calculate actual subtotal from DB (never trust client prices)
    let computedSubtotal = 0
    const validOrderItems = []

    for (const item of items) {
      if (item.variantId) {
        // It's a variant
        const { data: variant } = await supabase
          .from("product_variants")
          .select("price, stock_quantity, products(title)")
          .eq("id", item.variantId)
          .single()
        
        if (!variant || variant.stock_quantity < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 })
        }
        
        const price = Number(variant.price)
        computedSubtotal += price * item.quantity
        validOrderItems.push({
          product_id: item.id,
          variant_id: item.variantId,
          title: item.name,
          variant_info: { size: item.size, color: item.color },
          quantity: item.quantity,
          unit_price: price,
          line_total: price * item.quantity
        })
      } else {
        // Base product
        const { data: product } = await supabase
          .from("products")
          .select("price, sale_price, stock_quantity, title")
          .eq("id", item.id)
          .single()
          
        if (!product || product.stock_quantity < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 })
        }
        
        const price = product.sale_price ? Number(product.sale_price) : Number(product.price)
        computedSubtotal += price * item.quantity
        validOrderItems.push({
          product_id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: price,
          line_total: price * item.quantity
        })
      }
    }

    // 2. Compute Discounts
    let discountAmount = 0
    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .single()
        
      if (coupon && coupon.is_active) {
        const now = new Date()
        const isValid = (!coupon.valid_from || new Date(coupon.valid_from) <= now) &&
                        (!coupon.valid_to || new Date(coupon.valid_to) >= now) &&
                        (!coupon.usage_limit || coupon.times_used < coupon.usage_limit) &&
                        (!coupon.min_order_amount || computedSubtotal >= coupon.min_order_amount)
                        
        if (isValid) {
          if (coupon.type === "percentage") {
            discountAmount = (computedSubtotal * Number(coupon.value)) / 100
          } else {
            discountAmount = Number(coupon.value)
          }
        }
      }
    }

    // 3. Compute Tax and Shipping
    const { data: settings } = await supabase
      .from("site_settings")
      .select("tax_rate, tax_inclusive")
      .single()
      
    const taxRate = settings?.tax_rate ? Number(settings.tax_rate) : 0
    // Simplified shipping logic for test
    const shippingCost = computedSubtotal > 5000 ? 0 : 150 
    
    let taxAmount = 0
    const taxableAmount = Math.max(computedSubtotal - discountAmount, 0)
    
    if (taxRate > 0) {
      if (settings?.tax_inclusive) {
        // tax is already in the price, just calculate what portion is tax
        taxAmount = taxableAmount - (taxableAmount / (1 + taxRate / 100))
      } else {
        taxAmount = taxableAmount * (taxRate / 100)
      }
    }

    const finalTotal = taxableAmount + (settings?.tax_inclusive ? 0 : taxAmount) + shippingCost
    const amountInPaise = Math.round(finalTotal * 100)

    // 4. Initialize Razorpay Order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    })

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: user.id }
    })

    // 5. Create Order in DB
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        email: user.email,
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        shipping_method: shippingMethod || "Standard",
        shipping_cost: shippingCost,
        subtotal: computedSubtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total: finalTotal,
        coupon_code: couponCode ? couponCode.toUpperCase() : null,
        payment_status: "pending",
        fulfillment_status: "pending",
        razorpay_payment_id: razorpayOrder.id, // Store order ID here temporarily, later updated to payment ID on webhook
        notes: notes
      })
      .select()
      .single()

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message}`)
    }

    // 6. Insert Order Items
    const itemsToInsert = validOrderItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert)
    if (itemsError) {
      // In production, we'd have a compensating transaction or cleanup here
      console.error("Failed to insert order items:", itemsError)
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise
    })

  } catch (error: any) {
    console.error("[CREATE_ORDER]", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
