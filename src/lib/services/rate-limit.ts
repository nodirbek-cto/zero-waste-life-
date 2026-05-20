import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { AppError } from "./errors"

type RateLimitTarget = "scan_results" | "reports"

export async function enforceRateLimit({
  supabase,
  table,
  userId,
  limit,
  windowSeconds = 60,
}: {
  supabase: SupabaseClient<Database>
  table: RateLimitTarget
  userId: string
  limit: number
  windowSeconds?: number
}) {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString()
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since)

  if (error) throw new AppError("Failed to validate request rate.", "RATE_LIMIT_CHECK_FAILED", error.message)
  if ((count ?? 0) >= limit) {
    throw new AppError("Too many requests. Please wait a minute and try again.", "RATE_LIMIT")
  }
}
