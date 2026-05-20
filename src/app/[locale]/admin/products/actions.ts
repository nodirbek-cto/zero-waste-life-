"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { locales, defaultLocale, type Locale } from "@/i18n"
import { requireAdmin as requireSupabaseAdmin } from "@/lib/services/auth"
import { logAction } from "@/lib/services/audit"
import { toUserMessage } from "@/lib/services/errors"
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/services/products"

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
  title: z.string().min(2).max(120),
  description: z.string().min(5).max(4000),
  price: z.coerce.number().int().min(0),
  image_url: z.string().trim().max(512).optional(),
})

export async function createProductAction(_p: AdminState, formData: FormData): Promise<AdminState> {
  const parsed = createSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const admin = await requireAdmin()
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    const productId = await createProduct(admin.supabase, {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      image_url: parsed.data.image_url || null,
    })
    await logAction(admin.supabase, admin.user.id, "product.create", {
      type: "products",
      id: productId,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to create product.") }
  }

  revalidatePath(`/${locale}/admin/products`)
  revalidatePath(`/${locale}/app/shop`)
  return { status: "success", message: "Product created." }
}

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
})

export async function updateProductAction(_p: AdminState, formData: FormData): Promise<AdminState> {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const admin = await requireAdmin()
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    await updateProduct(admin.supabase, parsed.data.id, {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      image_url: parsed.data.image_url || null,
    })
    await logAction(admin.supabase, admin.user.id, "product.update", {
      type: "products",
      id: parsed.data.id,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to update product.") }
  }

  revalidatePath(`/${locale}/admin/products`)
  revalidatePath(`/${locale}/app/shop`)
  return { status: "success", message: "Product updated." }
}

const deleteSchema = z.object({
  locale: z.string().optional(),
  id: z.string().uuid(),
})

export async function deleteProductAction(_p: AdminState, formData: FormData): Promise<AdminState> {
  const parsed = deleteSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid input." }

  const admin = await requireAdmin()
  if (!admin.ok) return { status: "error", message: admin.message }

  try {
    await deleteProduct(admin.supabase, parsed.data.id)
    await logAction(admin.supabase, admin.user.id, "product.delete", {
      type: "products",
      id: parsed.data.id,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to delete product.") }
  }

  revalidatePath(`/${locale}/admin/products`)
  revalidatePath(`/${locale}/app/shop`)
  return { status: "success", message: "Deleted." }
}
