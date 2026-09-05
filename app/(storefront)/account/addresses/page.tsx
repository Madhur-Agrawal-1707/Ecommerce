import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddressActions } from "@/components/storefront/account/address-actions"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Addresses | My Account | Noir & Gold",
}

export default async function AddressesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in?next=/account/addresses")
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  return (
    <div className="container py-16 min-h-[60vh]">
      <div className="mb-6">
        <Link href="/account" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Account
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-bold">Addresses</h1>
        <Button asChild>
          <Link href="/account/addresses/new">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!addresses || addresses.length === 0 ? (
          <div className="col-span-full py-12 text-center border rounded-lg bg-surface text-muted-foreground">
            <MapPin className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <p>You haven't added any addresses yet.</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="bg-surface border border-border rounded-lg p-6 relative flex flex-col">
              {address.is_default && (
                <Badge variant="secondary" className="absolute top-4 right-4 bg-gold/10 text-gold hover:bg-gold/20 border-0">
                  Default
                </Badge>
              )}
              
              <h3 className="font-medium text-lg mb-2 pr-16">{address.full_name}</h3>
              <p className="text-sm text-muted-foreground mb-1">{address.address_line1}</p>
              {address.address_line2 && (
                <p className="text-sm text-muted-foreground mb-1">{address.address_line2}</p>
              )}
              <p className="text-sm text-muted-foreground mb-1">
                {address.city}, {address.state} {address.zip}
              </p>
              <p className="text-sm text-muted-foreground mb-3">{address.country}</p>
              
              {address.phone && (
                <p className="text-sm font-medium mt-2">Phone: <span className="font-normal text-muted-foreground">{address.phone}</span></p>
              )}
              
              <div className="mt-auto">
                <div className="flex gap-2 items-center">
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                      <Link href={`/account/addresses/${address.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                  <div className="flex-1">
                    <AddressActions id={address.id} isDefault={address.is_default} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
