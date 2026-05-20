import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { AppError } from "./errors"
import { enforceRateLimit } from "./rate-limit"
import { deleteFile, getSignedUrlCached, uploadFile } from "./storage"

async function signedUrlOrNull(
  supabase: SupabaseClient<Database>,
  path: string | null
) {
  try {
    return await getSignedUrlCached({ supabase, bucket: "scans", path })
  } catch {
    return null
  }
}

export async function createScanSubmission(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File
) {
  await enforceRateLimit({ supabase, table: "scan_results", userId, limit: 5 })
  const path = await uploadFile({ supabase, bucket: "scans", userId, file })
  const { error } = await supabase.from("scan_results").insert({
    user_id: userId,
    image_url: path,
    result_text: null,
    status: "pending",
  })

  if (error) throw new AppError("Failed to create scan submission.", "SCAN_CREATE_FAILED", error.message)
}

export async function listUserScans(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("scan_results")
    .select("id, user_id, image_url, result_text, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) throw new AppError("Failed to load scans.", "SCANS_LOAD_FAILED", error.message)

  return Promise.all(
    data.map(async (scan) => ({
      ...scan,
      signedImageUrl: await signedUrlOrNull(supabase, scan.image_url),
    }))
  )
}

export async function listAdminScans(
  supabase: SupabaseClient<Database>,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}
) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from("scan_results")
    .select("id, user_id, image_url, result_text, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw new AppError("Failed to load scans.", "SCANS_LOAD_FAILED", error.message)
  const rows = await Promise.all(
    data.map(async (scan) => ({
      ...scan,
      signedImageUrl: await signedUrlOrNull(supabase, scan.image_url),
    }))
  )
  return { data: rows, count: count ?? 0, page, pageSize }
}

export async function setScanResult(supabase: SupabaseClient<Database>, scanId: string, resultText: string) {
  const { error } = await supabase
    .from("scan_results")
    .update({ result_text: resultText, status: "done" })
    .eq("id", scanId)

  if (error) throw new AppError("Failed to update scan result.", "SCAN_UPDATE_FAILED", error.message)
}

export async function deleteScanResult(supabase: SupabaseClient<Database>, scanId: string) {
  const { data: scan, error: loadError } = await supabase
    .from("scan_results")
    .select("image_url")
    .eq("id", scanId)
    .maybeSingle()

  if (loadError) throw new AppError("Failed to load scan.", "SCAN_LOAD_FAILED", loadError.message)

  const { error } = await supabase.from("scan_results").delete().eq("id", scanId)
  if (error) throw new AppError("Failed to delete scan.", "SCAN_DELETE_FAILED", error.message)
  await deleteFile({ supabase, bucket: "scans", path: scan?.image_url ?? null })
}
