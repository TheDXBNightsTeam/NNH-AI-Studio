"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event) => {
      // Use getUser() instead of session?.user for security
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading, supabase }
}
