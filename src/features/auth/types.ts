import type { ProfileRole, Tables } from "@/lib/database.types"

export type Profile = Tables<"profiles">
export type AuthRole = ProfileRole
