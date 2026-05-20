import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { getVerifiedUser } from "@/lib/services/auth"
import { getProfileById } from "@/lib/services/profile"

export async function getCurrentProfile(supabase: SupabaseClient<Database>) {
  const user = await getVerifiedUser(supabase)
  if (!user) return null

  return getProfileById(supabase, user.id)
}
