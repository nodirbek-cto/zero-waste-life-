import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, ReportStatus } from "@/lib/database.types"
import { AppError } from "./errors"
import { enforceRateLimit } from "./rate-limit"
import { getSignedUrlCached, uploadFile } from "./storage"

async function signedUrlOrNull(
  supabase: SupabaseClient<Database>,
  path: string | null
) {
  try {
    return await getSignedUrlCached({ supabase, bucket: "reports", path })
  } catch {
    return null
  }
}

export async function createReportSubmission({
  supabase,
  userId,
  title,
  description,
  file,
}: {
  supabase: SupabaseClient<Database>
  userId: string
  title: string
  description: string
  file?: File
}) {
  await enforceRateLimit({ supabase, table: "reports", userId, limit: 3 })
  const imagePath =
    file && file.size > 0
      ? await uploadFile({ supabase, bucket: "reports", userId, file })
      : null

  const { error } = await supabase.from("reports").insert({
    user_id: userId,
    title,
    description,
    image_url: imagePath,
    status: "pending",
  })

  if (error) throw new AppError("Failed to create report.", "REPORT_CREATE_FAILED", error.message)
}

export async function listUserReports(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("reports")
    .select("id, user_id, title, description, image_url, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) throw new AppError("Failed to load reports.", "REPORTS_LOAD_FAILED", error.message)

  return Promise.all(
    data.map(async (report) => ({
      ...report,
      signedImageUrl: await signedUrlOrNull(supabase, report.image_url),
    }))
  )
}

export async function listAdminReports(
  supabase: SupabaseClient<Database>,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}
) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from("reports")
    .select("id, user_id, title, description, image_url, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw new AppError("Failed to load reports.", "REPORTS_LOAD_FAILED", error.message)
  const rows = await Promise.all(
    data.map(async (report) => ({
      ...report,
      signedImageUrl: await signedUrlOrNull(supabase, report.image_url),
    }))
  )
  return { data: rows, count: count ?? 0, page, pageSize }
}

export async function updateReportStatus(
  supabase: SupabaseClient<Database>,
  reportId: string,
  status: Exclude<ReportStatus, "pending">
) {
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId)
  if (error) throw new AppError("Failed to update report status.", "REPORT_UPDATE_FAILED", error.message)
}
