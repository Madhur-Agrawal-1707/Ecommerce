"use client"

import * as React from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextValue {
  user: User | null
  profile: any | null
  /** Whether the initial auth check has completed. Use to avoid flash-of-unauthenticated-content. */
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()

    async function fetchUserAndProfile(sessionUser: User | null) {
      if (!sessionUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(sessionUser)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single()
      
      setProfile(data)
      setLoading(false)
    }

    // Initial session check
    supabase.auth.getUser().then(({ data }) => {
      fetchUserAndProfile(data.user)
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchUserAndProfile(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = React.useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, profile, loading, signOut }),
    [user, profile, loading, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
