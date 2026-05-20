"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { locales, defaultLocale, type Locale } from "@/i18n"
import { createScanSubmission } from "@/features/scanner/api"
import { getVerifiedUser } from "@/lib/services/auth"

function coerceLocale(value: unknown): Locale {
  const l = typeof value === "string" ? value : ""
  return locales.includes(l as Locale) ? (l as Locale) : defaultLocale
}

export type SubmitScanState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string }

const schema = z.object({
  locale: z.string().optional(),
})

export async function submitScanAction(
  _prev: SubmitScanState,
  formData: FormData
): Promise<SubmitScanState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)

  const file = formData.get("image")
  if (!(file instanceof File)) {
    return { status: "error", message: "Please select an image." }
  }
  if (file.size <= 0) return { status: "error", message: "Empty file." }

  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)
  if (!user) return { status: "error", message: "You must be signed in." }

  try {
    await createScanSubmission(supabase, user.id, file)
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to submit scan.",
    }
  }

  revalidatePath(`/${locale}/app/scanner`)
  return { status: "success", message: "Submitted. Waiting for admin to write result." }
}
