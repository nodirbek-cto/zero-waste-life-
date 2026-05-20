import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, ProfileRole } from "@/lib/database.types"
import { AppError } from "./errors"

export async function signInWithPassword(
  supabase: SupabaseClient<Database>,
  credentials: { email: string; password: string }
) {
  const { error } = await supabase.auth.signInWithPassword(credentials)
  if (error) throw new AppError("Invalid email or password.", "AUTH_SIGN_IN_FAILED", error.message)
}

export async function signUpWithPassword(
  supabase: SupabaseClient<Database>,
  values: { email: string; password: string; fullName: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
      },
    },
  })

  if (error) throw new AppError("Failed to create account.", "AUTH_SIGN_UP_FAILED", error.message)
  return data
}

export async function signOut(supabase: SupabaseClient<Database>) {
  const { error } = await supabase.auth.signOut()
  if (error) throw new AppError("Failed to sign out.", "AUTH_SIGN_OUT_FAILED", error.message)
}

export async function getVerifiedUser(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

export async function getCurrentRole(supabase: SupabaseClient<Database>): Promise<ProfileRole | null> {
  const user = await getVerifiedUser(supabase)
  if (!user) return null

  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  return data?.role ?? null
}

export async function requireAdmin(supabase: SupabaseClient<Database>) {
  const user = await getVerifiedUser(supabase)
  if (!user) return { ok: false as const, message: "Not signed in." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") return { ok: false as const, message: "Forbidden." }
  return { ok: true as const, user }
}
