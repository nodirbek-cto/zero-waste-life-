"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { locales, defaultLocale, type Locale as LocaleType } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/services/auth"
import { logAction } from "@/lib/services/audit"
import { toUserMessage } from "@/lib/services/errors"
import { updateReportStatus } from "@/lib/services/reports"
import { deleteScanResult, setScanResult } from "@/lib/services/scans"

function coerceLocale(value: unknown): LocaleType {
  const l = typeof value === "string" ? value : ""
  return locales.includes(l as LocaleType) ? (l as LocaleType) : defaultLocale
}

export type ReviewState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string }

const setResultSchema = z.object({
  locale: z.string().optional(),
  scan_id: z.string().uuid(),
  result_text: z.string().min(1).max(4000),
})

export async function setScanResultAction(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const parsed = setResultSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }
  const supabase = await createSupabaseServerClient()
  const admin = await requireAdmin(supabase)
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    await setScanResult(supabase, parsed.data.scan_id, parsed.data.result_text)
    await logAction(supabase, admin.user.id, "scan_result.update", {
      type: "scan_results",
      id: parsed.data.scan_id,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to update scan result.") }
  }

  revalidatePath(`/${locale}/admin/scans`)
  revalidatePath(`/${locale}/app/scanner`)
  revalidatePath(`/${locale}/app/dashboard`)
  return { status: "success", message: "Scan result updated." }
}

const deleteScanSchema = z.object({
  locale: z.string().optional(),
  scan_id: z.string().uuid(),
})

export async function deleteScanResultAction(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const parsed = deleteScanSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const supabase = await createSupabaseServerClient()
  const admin = await requireAdmin(supabase)
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    await deleteScanResult(supabase, parsed.data.scan_id)
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to delete scan.") }
  }

  revalidatePath(`/${locale}/admin/scans`)
  revalidatePath(`/${locale}/app/scanner`)
  return { status: "success", message: "Deleted." }
}

const updateReportSchema = z.object({
  locale: z.string().optional(),
  report_id: z.string().uuid(),
  status: z.enum(["reviewed", "resolved"]),
})

export async function updateReportStatusAction(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const parsed = updateReportSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const supabase = await createSupabaseServerClient()
  const admin = await requireAdmin(supabase)
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    await updateReportStatus(supabase, parsed.data.report_id, parsed.data.status)
    await logAction(supabase, admin.user.id, "report_status.update", {
      type: "reports",
      id: parsed.data.report_id,
      metadata: { status: parsed.data.status },
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to update report status.") }
  }

  revalidatePath(`/${locale}/admin/reports`)
  revalidatePath(`/${locale}/app/report`)
  revalidatePath(`/${locale}/app/dashboard`)
  return { status: "success", message: "Report status updated." }
}
