import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProfileForm } from "@/components/storefront/account/profile-form"

export const metadata = {
  title: "Profile Details | My Account | Noir & Gold",
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in?next=/account/profile")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const initialData = {
    full_name: profile?.full_name || "",
    email: user.email || "",
    phone: profile?.phone || ""
  }

  return (
    <div className="container py-16 min-h-[60vh]">
      <div className="mb-6">
        <Link href="/account" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Account
        </Link>
      </div>
      
      <h1 className="font-serif text-3xl font-bold mb-8">Profile Details</h1>
      
      <div className="bg-surface border border-border rounded-lg p-8 max-w-2xl">
        <ProfileForm initialData={initialData} />
      </div>
    </div>
  )
}
