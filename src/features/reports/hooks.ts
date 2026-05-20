"use client"

import { useCallback, useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { listUserReports } from "./api"
import type { ReportWithSignedUrl } from "./types"

export function useUserReports(userId: string | null) {
  const [data, setData] = useState<ReportWithSignedUrl[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(userId))

  const refetch = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      setData(await listUserReports(createSupabaseBrowserClient(), userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, error, isLoading, refetch }
}
