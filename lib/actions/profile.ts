"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(data: { 
  full_name: string; 
  phone: string;
  password?: string;
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Update profile details
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      phone: data.phone,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id)

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`)
  }

  // Update password if provided
  if (data.password && data.password.trim().length > 0) {
    const { error: authError } = await supabase.auth.updateUser({
      password: data.password
    })
    
    if (authError) {
      throw new Error(`Failed to update password: ${authError.message}`)
    }
  }

  revalidatePath("/account")
  revalidatePath("/account/profile")
  
  return { success: true }
}
