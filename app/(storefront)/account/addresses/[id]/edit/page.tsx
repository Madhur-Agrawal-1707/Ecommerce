import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AddressForm } from "@/components/storefront/account/address-form"

export const metadata = {
  title: "Edit Address | My Account | Noir & Gold",
}

export default async function EditAddressPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/sign-in?next=/account/addresses/${params.id}/edit`)
  }

  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!address) {
    notFound()
  }

  return (
    <div className="container py-16 min-h-[60vh]">
      <div className="mb-6">
        <Link href="/account/addresses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Addresses
        </Link>
      </div>
      
      <h1 className="font-serif text-3xl font-bold mb-8">Edit Address</h1>
      
      <div className="bg-surface border border-border rounded-lg p-8 max-w-2xl">
        <AddressForm initialData={address} />
      </div>
    </div>
  )
}
