import { createClient } from "@supabase/supabase-js"
import "server-only"

// Use this ONLY in server actions or route handlers where you need to bypass RLS.
// NEVER expose this to the client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
