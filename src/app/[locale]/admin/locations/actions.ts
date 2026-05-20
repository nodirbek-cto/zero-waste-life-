"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { locales, defaultLocale, type Locale } from "@/i18n"
import { requireAdmin as requireSupabaseAdmin } from "@/lib/services/auth"
import { logAction } from "@/lib/services/audit"
import { toUserMessage } from "@/lib/services/errors"
import {
  createLocation,
  deleteLocation,
  updateLocation,
} from "@/lib/services/locations"

function coerceLocale(value: unknown): Locale {
  const l = typeof value === "string" ? value : ""
  return locales.includes(l as Locale) ? (l as Locale) : defaultLocale
}

export type AdminState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string }

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const admin = await requireSupabaseAdmin(supabase)
  if (!admin.ok) return admin
  return { ok: true as const, supabase, user: admin.user }
}

const createSchema = z.object({
  locale: z.string().optional(),
  name: z.string().min(2).max(120),
  description: z.string().min(5).max(4000),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
})

export async function createLocationAction(_p: AdminState, formData: FormData): Promise<AdminState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const admin = await requireAdmin()
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    const locationId = await createLocation(admin.supabase, {
      name: parsed.data.name,
      description: parsed.data.description,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    })
    await logAction(admin.supabase, admin.user.id, "location.create", {
      type: "locations",
      id: locationId,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to create location.") }
  }

  revalidatePath(`/${locale}/admin/locations`)
  revalidatePath(`/${locale}/app/map`)
  return { status: "success", message: "Location created." }
}

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
})

export async function updateLocationAction(_p: AdminState, formData: FormData): Promise<AdminState> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const admin = await requireAdmin()
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    await updateLocation(admin.supabase, parsed.data.id, {
      name: parsed.data.name,
      description: parsed.data.description,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    })
    await logAction(admin.supabase, admin.user.id, "location.update", {
      type: "locations",
      id: parsed.data.id,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to update location.") }
  }

  revalidatePath(`/${locale}/admin/locations`)
  revalidatePath(`/${locale}/app/map`)
  return { status: "success", message: "Location updated." }
}

const deleteSchema = z.object({
  locale: z.string().optional(),
  id: z.string().uuid(),
})

export async function deleteLocationAction(_p: AdminState, formData: FormData): Promise<AdminState> {
  const parsed = deleteSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const admin = await requireAdmin()
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    await deleteLocation(admin.supabase, parsed.data.id)
    await logAction(admin.supabase, admin.user.id, "location.delete", {
      type: "locations",
      id: parsed.data.id,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to delete location.") }
  }

  revalidatePath(`/${locale}/admin/locations`)
  revalidatePath(`/${locale}/app/map`)
  return { status: "success", message: "Deleted." }
}
