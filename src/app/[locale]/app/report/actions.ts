"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { locales, defaultLocale, type Locale } from "@/i18n"
import { createReportSubmission } from "@/features/reports/api"
import { getVerifiedUser } from "@/lib/services/auth"

function coerceLocale(value: unknown): Locale {
  const l = typeof value === "string" ? value : ""
  return locales.includes(l as Locale) ? (l as Locale) : defaultLocale
}

export type SubmitReportState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string }

const schema = z.object({
  locale: z.string().optional(),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
})

export async function submitReportAction(
  _prev: SubmitReportState,
  formData: FormData
): Promise<SubmitReportState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)
  if (!user) return { status: "error", message: "You must be signed in." }

  const file = formData.get("image")
  try {
    await createReportSubmission({
      supabase,
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      file: file instanceof File ? file : undefined,
    })
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to submit report.",
    }
  }

  revalidatePath(`/${locale}/app/report`)
  revalidatePath(`/${locale}/app/dashboard`)
  return { status: "success", message: "Report submitted." }
}
