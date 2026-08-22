import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "My Account | Noir & Gold",
}

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in?next=/account")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="container py-16 min-h-[60vh]">
      <h1 className="font-serif text-3xl font-bold mb-8">My Account</h1>
      
      <div className="bg-surface border border-border rounded-lg p-8">
        <h2 className="text-xl font-medium mb-4">Welcome back, {profile?.full_name || user.email}!</h2>
        <p className="text-muted-foreground mb-6">
          This is your account dashboard. From here you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {/* Orders */}
          <div className="p-6 border border-border rounded-md hover:border-gold transition-colors">
            <h3 className="font-medium text-lg mb-2">Orders</h3>
            <p className="text-sm text-muted-foreground mb-4">View your order history and track recent shipments.</p>
            {/* Note: Full implementation planned for next phase */}
            <span className="text-sm text-gold">Coming soon</span>
          </div>
          
          {/* Addresses */}
          <div className="p-6 border border-border rounded-md hover:border-gold transition-colors">
            <h3 className="font-medium text-lg mb-2">Addresses</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage your default shipping and billing addresses.</p>
            <span className="text-sm text-gold">Coming soon</span>
          </div>

          {/* Profile */}
          <div className="p-6 border border-border rounded-md hover:border-gold transition-colors">
            <h3 className="font-medium text-lg mb-2">Profile Details</h3>
            <p className="text-sm text-muted-foreground mb-4">Update your name, email, and password.</p>
            <span className="text-sm text-gold">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
