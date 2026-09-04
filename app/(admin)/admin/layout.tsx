import * as React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogOut, ExternalLink } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side role check (belt-and-suspenders on top of middleware)
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/")

  return (
    <div className="admin flex h-screen overflow-hidden bg-background text-foreground print:h-auto print:overflow-visible print:bg-white print:text-black">
      {/* Sidebar */}
      <div className="print:hidden">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6 print:hidden">
          <div />
          <div className="flex items-center gap-4">
            {/* View storefront */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View Storefront</span>
            </Link>

            {/* Admin identity */}
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? "Admin"}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {(profile?.full_name ?? user.email ?? "A").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden md:inline">
                {profile?.full_name ?? user.email}
              </span>
            </div>

            {/* Sign out */}
            <form action="/api/auth/sign-out" method="post">
              <button
                type="submit"
                aria-label="Sign out"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 print:p-0 print:overflow-visible print:w-full">{children}</main>
      </div>
    </div>
  )
}
