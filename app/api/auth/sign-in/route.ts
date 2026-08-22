import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get("email"))
  const password = String(formData.get("password"))
  const supabase = createClient()

  // For testing auth round-trip, we will try to sign in, and if it fails, sign up.
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (signUpError) {
      return NextResponse.redirect(new URL("/?error=auth-failed", request.url))
    }
  }

  return NextResponse.redirect(new URL("/", request.url))
}
