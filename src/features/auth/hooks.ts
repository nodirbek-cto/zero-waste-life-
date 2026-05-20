"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { getCurrentProfile } from "./api"
import type { Profile } from "./types"

export function useCurrentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCurrentProfile(createSupabaseBrowserClient())
      .then(setProfile)
      .finally(() => setIsLoading(false))
  }, [])

  return { profile, isLoading }
}
