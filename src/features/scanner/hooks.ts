"use client"

import { useCallback, useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { listUserScans } from "./api"
import type { ScanWithSignedUrl } from "./types"

export function useUserScans(userId: string | null) {
  const [data, setData] = useState<ScanWithSignedUrl[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(userId))

  const refetch = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      setData(await listUserScans(createSupabaseBrowserClient(), userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scans.")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, error, isLoading, refetch }
}
