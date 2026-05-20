import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { AppError } from "./errors"

export async function getProfileById(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, points, role, created_at")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw new AppError("Failed to load profile.", "PROFILE_LOAD_FAILED", error.message)
  return data
}

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  values: { fullName: string; avatarUrl: string }
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.fullName || null,
      avatar_url: values.avatarUrl || null,
    })
    .eq("id", userId)

  if (error) throw new AppError("Failed to update profile.", "PROFILE_UPDATE_FAILED", error.message)
}
