"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type AddressFormValues = {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

export async function createAddress(data: AddressFormValues) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (data.is_default) {
    // Unset other default addresses
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    ...data
  })

  if (error) throw new Error(`Failed to create address: ${error.message}`)

  revalidatePath("/account/addresses")
}

export async function updateAddress(id: string, data: AddressFormValues) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Verify ownership
  const { data: existing } = await supabase.from("addresses").select("user_id").eq("id", id).single()
  if (existing?.user_id !== user.id) throw new Error("Unauthorized")

  if (data.is_default) {
    // Unset other default addresses
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
  }

  const { error } = await supabase.from("addresses").update({
    ...data
  }).eq("id", id)

  if (error) throw new Error(`Failed to update address: ${error.message}`)

  revalidatePath("/account/addresses")
}

export async function deleteAddress(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Verify ownership
  const { data: existing } = await supabase.from("addresses").select("user_id").eq("id", id).single()
  if (existing?.user_id !== user.id) throw new Error("Unauthorized")

  const { error } = await supabase.from("addresses").delete().eq("id", id)

  if (error) throw new Error(`Failed to delete address: ${error.message}`)

  revalidatePath("/account/addresses")
}

export async function setDefaultAddress(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Verify ownership
  const { data: existing } = await supabase.from("addresses").select("user_id").eq("id", id).single()
  if (existing?.user_id !== user.id) throw new Error("Unauthorized")

  // Unset other default addresses
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
  
  // Set new default
  const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id)

  if (error) throw new Error(`Failed to set default address: ${error.message}`)

  revalidatePath("/account/addresses")
}
