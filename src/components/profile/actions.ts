"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import type { Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getVerifiedUser } from "@/lib/services/auth"
import { toUserMessage } from "@/lib/services/errors"
import { updateProfile } from "@/lib/services/profile"

export type UpdateProfileState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

const schema = z.object({
  locale: z.string().optional(),
  full_name: z.string().max(80).optional().default(""),
  avatar_url: z.string().max(500).optional().default(""),
})

export async function updateProfileAction(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { status: "error", message: "Please check your inputs and try again." }
  }

  const locale = (parsed.data.locale as Locale) || "en"
  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)

  if (!user) {
    return { status: "error", message: "You must be signed in." }
  }

  try {
    await updateProfile(supabase, user.id, {
      fullName: parsed.data.full_name,
      avatarUrl: parsed.data.avatar_url,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to update profile.") }
  }

  revalidatePath(`/${locale}/app/profile`)
  return { status: "success", message: "Profile updated." }
}
