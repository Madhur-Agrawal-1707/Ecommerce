"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { Loader2, CheckCircle2, ChevronRight, Lock, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const router = useRouter()
  
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [isProcessing, setIsProcessing] = React.useState(false)
  
  // Data
  const [savedAddresses, setSavedAddresses] = React.useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("new")
  const [isLoadingData, setIsLoadingData] = React.useState(true)

  // Form State
  const [shippingAddress, setShippingAddress] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    country: "India"
  })
  
  const [couponCode, setCouponCode] = React.useState("")
  const [discount, setDiscount] = React.useState({ amount: 0, code: "" })
  const [couponError, setCouponError] = React.useState("")
  const [couponApplying, setCouponApplying] = React.useState(false)
  
  // GSAP Step indicator ref
  const progressRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/sign-in?next=/checkout")
    }
  }, [user, authLoading, router])

  React.useEffect(() => {
    async function loadData() {
      if (user) {
        setIsLoadingData(true)
        try {
          const supabase = createClient()
          
          // Fetch profile and addresses in parallel
          const [profileRes, addressesRes] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: false })
          ])
          
          const profile = profileRes.data
          const addresses = addressesRes.data || []
          
          setSavedAddresses(addresses)

          if (addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.is_default) || addresses[0]
            setSelectedAddressId(defaultAddr.id)
            setShippingAddress({
              fullName: defaultAddr.full_name || "",
              email: user.email || "",
              phone: defaultAddr.phone || profile?.phone || "",
              addressLine1: defaultAddr.address_line1 || "",
              addressLine2: defaultAddr.address_line2 || "",
              city: defaultAddr.city || "",
              state: defaultAddr.state || "",
              zip: defaultAddr.zip || "",
              country: defaultAddr.country || "India"
            })
          } else {
             // Populate from profile if no addresses
             setShippingAddress(prev => ({
               ...prev,
               fullName: profile?.full_name || user.user_metadata?.full_name || "",
               phone: profile?.phone || "",
               email: user.email || "",
             }))
          }
        } catch (error) {
          console.error("Error loading user data", error)
        } finally {
          setIsLoadingData(false)
        }
      } else {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [user])

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id)
    if (id !== "new") {
      const addr = savedAddresses.find(a => a.id === id)
      if (addr) {
        setShippingAddress(prev => ({
          ...prev,
          fullName: addr.full_name || "",
          phone: addr.phone || prev.phone,
          addressLine1: addr.address_line1 || "",
          addressLine2: addr.address_line2 || "",
          city: addr.city || "",
          state: addr.state || "",
          zip: addr.zip || "",
          country: addr.country || "India"
        }))
      }
    } else {
      // Clear fields for new address, keep name/email/phone from profile
      setShippingAddress(prev => ({
        ...prev,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zip: "",
        country: "India"
      }))
    }
  }

  // When a user types into the form, if they were on a saved address, we optionally switch them to "new" 
  // or we just let them edit the current fields (it won't overwrite their saved address unless we add a "Save" feature).
  // For simplicity, we just let them edit the fields. The `shippingAddress` state drives the order.
  const handleInputChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  useGSAP(() => {
    if (progressRef.current) {
      const progressWidth = step === 1 ? "33%" : step === 2 ? "66%" : "100%"
      gsap.to(progressRef.current, { width: progressWidth, duration: 0.5, ease: "power2.out" })
    }
  }, [step])

  if (authLoading || !user || isLoadingData) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
  }

  if (items.length === 0) {
    router.replace("/cart")
    return null
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setCouponApplying(true)
    setCouponError("")
    
    try {
      const res = await fetch("/api/checkout/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      let amount = 0
      if (data.type === "percentage") {
        amount = (subtotal * Number(data.value)) / 100
      } else {
        amount = Number(data.value)
      }
      
      setDiscount({ amount, code: data.code })
      setCouponCode("")
    } catch (err: any) {
      setCouponError(err.message)
    } finally {
      setCouponApplying(false)
    }
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress,
          billingAddress: shippingAddress,
          couponCode: discount.code || undefined,
          shippingMethod: "Standard"
        })
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error)

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Public key
        amount: orderData.amount,
        currency: "INR",
        name: "Noir & Gold",
        description: "Test Transaction",
        order_id: orderData.razorpayOrderId,
        handler: function (response: any) {
          // Client-side success callback. Real fulfillment trusts the webhook.
          clearCart()
          router.push(`/checkout/success?order_id=${orderData.orderId}`)
        },
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: "#d4af37" // Gold
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        console.error(response.error)
        setIsProcessing(false)
        alert("Payment failed: " + response.error.description)
      })
      rzp.open()

    } catch (err: any) {
      console.error(err)
      alert(err.message)
      setIsProcessing(false)
    }
  }

  // Derived totals for UI display (Server still validates)
  const shipping = subtotal > 5000 ? 0 : 150
  const estimatedTotal = Math.max(subtotal - discount.amount, 0) + shipping

  return (
    <div className="bg-background min-h-screen">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Header compact */}
      <header className="border-b border-border bg-surface sticky top-0 z-10 py-4">
        <div className="container flex justify-between items-center">
          <div className="font-serif text-xl font-bold">Noir <span className="text-gold">&</span> Gold</div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Lock className="w-4 h-4 mr-2" /> Secure Checkout
          </div>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Main Flow */}
          <div className="lg:col-span-7 xl:col-span-8">
            
            {/* Step Indicator */}
            <div className="mb-10">
              <div className="flex justify-between text-sm font-medium mb-3 text-muted-foreground">
                <span className={step >= 1 ? "text-foreground" : ""}>Shipping</span>
                <span className={step >= 2 ? "text-foreground" : ""}>Payment</span>
                <span className={step >= 3 ? "text-foreground" : ""}>Review</span>
              </div>
              <div className="h-1 bg-surface rounded-full overflow-hidden">
                <div ref={progressRef} className="h-full bg-gold w-1/3" />
              </div>
            </div>

            {/* Step 1: Shipping */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Address Selection */}
                {savedAddresses.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-serif mb-4">Select Shipping Address</h2>
                    <RadioGroup 
                      value={selectedAddressId} 
                      onValueChange={handleAddressSelect}
                      className="grid gap-4"
                    >
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className="flex items-start space-x-3 border p-4 rounded-lg bg-surface">
                          <RadioGroupItem value={addr.id} id={`addr-${addr.id}`} className="mt-1" />
                          <Label htmlFor={`addr-${addr.id}`} className="flex-1 cursor-pointer">
                            <span className="block font-medium mb-1">
                              {addr.full_name} 
                              {addr.is_default && <span className="ml-2 text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded uppercase tracking-wider font-bold">Default</span>}
                            </span>
                            <span className="block text-muted-foreground font-normal leading-relaxed text-sm">
                              {addr.address_line1} {addr.address_line2 ? `, ${addr.address_line2}` : ""} <br />
                              {addr.city}, {addr.state} {addr.zip} <br />
                              {addr.country}
                            </span>
                            {addr.phone && <span className="block mt-1 font-normal text-sm text-muted-foreground">Phone: {addr.phone}</span>}
                          </Label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-3 border p-4 rounded-lg bg-surface ">
                        <RadioGroupItem value="new" id="addr-new" />
                        <Label htmlFor="addr-new" className="font-medium cursor-pointer flex-1 ">Use a new address</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-serif mb-4">
                    {savedAddresses.length > 0 && selectedAddressId !== "new" ? "Edit Selected Address for this order" : "Shipping Information"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input required id="fullName" value={shippingAddress.fullName} onChange={e => handleInputChange("fullName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input required type="email" id="email" value={shippingAddress.email} onChange={e => handleInputChange("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input required id="phone" value={shippingAddress.phone} onChange={e => handleInputChange("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine1">Address Line 1</Label>
                      <Input required id="addressLine1" value={shippingAddress.addressLine1} onChange={e => handleInputChange("addressLine1", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                      <Input id="addressLine2" value={shippingAddress.addressLine2} onChange={e => handleInputChange("addressLine2", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="city">City</Label>
                      <Input required id="city" value={shippingAddress.city} onChange={e => handleInputChange("city", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input required id="state" value={shippingAddress.state} onChange={e => handleInputChange("state", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input required id="zip" value={shippingAddress.zip} onChange={e => handleInputChange("zip", e.target.value)} />
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto bg-gold text-black hover:bg-gold-bright mt-8">
                  Continue to Payment <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}

            {/* Step 2: Payment Prep */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-serif mb-6">Payment Method</h2>
                <div className="border border-border rounded-lg p-6 bg-surface">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-5 h-5 rounded-full border-4 border-gold bg-background flex items-center justify-center" />
                    <span className="font-medium">Razorpay Secure Checkout</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-9">
                    Pay securely using UPI, Credit/Debit Cards, NetBanking, or Wallets via Razorpay.
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="bg-gold text-black hover:bg-gold-bright">
                    Review Order <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Pay */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-serif mb-6">Review Your Order</h2>
                
                <div className="border border-border rounded-lg p-6 bg-surface space-y-4">
                  <div className="flex justify-between border-b border-border pb-4">
                    <span className="text-muted-foreground">Shipping to</span>
                    <div className="text-right text-sm">
                      <p className="font-medium">{shippingAddress.fullName}</p>
                      <p>{shippingAddress.addressLine1}, {shippingAddress.city}</p>
                      <p>{shippingAddress.state} {shippingAddress.zip}</p>
                      <p className="mt-1 text-muted-foreground">{shippingAddress.phone}</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Method</span>
                    <span className="text-sm font-medium">Standard Delivery</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={isProcessing}>Back</Button>
                  <Button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="flex-1 bg-gold text-black hover:bg-gold-bright"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {isProcessing ? "Processing..." : `Pay ₹${estimatedTotal.toLocaleString("en-IN")}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-surface border border-border rounded-lg p-6 sticky top-24">
              <h3 className="font-serif text-lg font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                {items.map(item => (
                  <div key={`${item.id}-${item.variantId}`} className="flex gap-4">
                    <div className="w-16 h-20 bg-background rounded overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center text-sm">
                      <span className="font-medium line-clamp-2">{item.name}</span>
                      <span className="text-muted-foreground mt-1">Qty: {item.quantity}</span>
                    </div>
                    <div className="font-medium text-sm flex items-center">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="border-t border-border pt-6 mb-6">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Discount code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplying || !!discount.code}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || couponApplying || !!discount.code}
                  >
                    {couponApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
                {couponError && <p className="text-xs text-destructive mt-2">{couponError}</p>}
                {discount.code && (
                  <div className="flex justify-between items-center mt-3 bg-gold/10 px-3 py-2 rounded-md border border-gold/20">
                    <span className="text-sm font-medium text-gold">{discount.code} applied</span>
                    <button onClick={() => setDiscount({ amount: 0, code: "" })} className="text-muted-foreground hover:text-foreground text-xs">Remove</button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm border-t border-border pt-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount.amount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Discount</span>
                    <span>-₹{discount.amount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`}</span>
                </div>
              </div>

              <div className="border-t border-border mt-6 pt-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block mb-1">INR</span>
                    <span className="font-bold text-2xl">₹{estimatedTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
