import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, ReportStatus } from "@/lib/database.types"
import { AppError } from "./errors"

export type DashboardSummary = {
  scansCount: number
  reportsCount: number
  recentReports: Array<{
    id: string
    title: string
    status: ReportStatus
    created_at: string
  }>
}

export async function getDashboardSummary(supabase: SupabaseClient<Database>, userId: string) {
  const [scans, reports, recentReports] = await Promise.all([
    supabase.from("scan_results").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("reports")
      .select("id, title, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const error = scans.error ?? reports.error ?? recentReports.error
  if (error) throw new AppError("Failed to load dashboard.", "DASHBOARD_LOAD_FAILED", error.message)

  return {
    scansCount: scans.count ?? 0,
    reportsCount: reports.count ?? 0,
    recentReports: recentReports.data ?? [],
  } satisfies DashboardSummary
}
