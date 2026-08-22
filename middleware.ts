import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only gate /admin/** and /account/** paths
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/account")) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Build an SSR Supabase client that reads/writes cookies on the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verify session exists
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[Middleware] check - Path:", pathname, "User found:", !!user, user?.id, user?.email)

  if (!user) {
    console.log("[Middleware] check - Redirecting because no user")
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.redirect(new URL(`/auth/sign-in?next=${encodeURIComponent(pathname)}`, request.url))
  }

  // For /admin/** paths, verify admin role
  if (pathname.startsWith("/admin")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    console.log("[Middleware] /admin check - Profile role:", profile?.role, "Error:", error)

    if (profile?.role !== "admin") {
      console.log("[Middleware] /admin check - Redirecting to / because role is not admin")
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match /admin and /account paths.
     * Exclude static files, Next.js internals, and image optimization routes.
     */
    "/admin/:path*",
    "/account/:path*"
  ],
}
