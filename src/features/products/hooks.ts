"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { listProducts } from "./api"
import type { Product } from "./types"

export function useProducts() {
  const [data, setData] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listProducts(createSupabaseBrowserClient())
      .then((result) => setData(result.data))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading }
}
