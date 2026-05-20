import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Inserts, Updates } from "@/lib/database.types"
import { AppError } from "./errors"

export async function listLocations(
  supabase: SupabaseClient<Database>,
  { page = 1, pageSize = 200 }: { page?: number; pageSize?: number } = {}
) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from("locations")
    .select("id, name, description, latitude, longitude, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw new AppError("Failed to load locations.", "LOCATIONS_LOAD_FAILED", error.message)
  return { data: data ?? [], count: count ?? 0, page, pageSize }
}

export async function createLocation(supabase: SupabaseClient<Database>, values: Inserts<"locations">) {
  const { data, error } = await supabase.from("locations").insert(values).select("id").single()
  if (error) throw new AppError("Failed to create location.", "LOCATION_CREATE_FAILED", error.message)
  return data.id
}

export async function updateLocation(supabase: SupabaseClient<Database>, id: string, values: Updates<"locations">) {
  const { error } = await supabase.from("locations").update(values).eq("id", id)
  if (error) throw new AppError("Failed to update location.", "LOCATION_UPDATE_FAILED", error.message)
}

export async function deleteLocation(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("locations").delete().eq("id", id)
  if (error) throw new AppError("Failed to delete location.", "LOCATION_DELETE_FAILED", error.message)
}
