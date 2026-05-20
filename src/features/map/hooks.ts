"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { listLocations } from "./api"
import type { Location } from "./types"

export function useLocations() {
  const [data, setData] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listLocations(createSupabaseBrowserClient())
      .then((result) => setData(result.data))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading }
}
