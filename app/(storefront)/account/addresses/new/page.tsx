import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AddressForm } from "@/components/storefront/account/address-form"

export const metadata = {
  title: "Add New Address | My Account | Noir & Gold",
}

export default async function NewAddressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in?next=/account/addresses/new")
  }

  return (
    <div className="container py-16 min-h-[60vh]">
      <div className="mb-6">
        <Link href="/account/addresses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Addresses
        </Link>
      </div>
      
      <h1 className="font-serif text-3xl font-bold mb-8">Add New Address</h1>
      
      <div className="bg-surface border border-border rounded-lg p-8 max-w-2xl">
        <AddressForm />
      </div>
    </div>
  )
}
