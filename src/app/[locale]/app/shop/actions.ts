"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { defaultLocale, locales, type Locale } from "@/i18n"
import { buyProduct } from "@/features/products/api"
import { getVerifiedUser } from "@/lib/services/auth"
import { toUserMessage } from "@/lib/services/errors"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function coerceLocale(value: unknown): Locale {
  const l = typeof value === "string" ? value : ""
  return locales.includes(l as Locale) ? (l as Locale) : defaultLocale
}

export type BuyProductState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string; productId: string; pointsRemaining: number }

const schema = z.object({
  locale: z.string().optional(),
  productId: z.string().uuid(),
})

export async function buyProductAction(
  _prev: BuyProductState,
  formData: FormData
): Promise<BuyProductState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)
  if (!parsed.success) return { status: "error", message: "Invalid product." }

  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)
  if (!user) return { status: "error", message: "You must be signed in." }

  try {
    const purchase = await buyProduct(supabase, user.id, parsed.data.productId)

    revalidatePath(`/${locale}/app/shop`)
    revalidatePath(`/${locale}/app/profile`)
    revalidatePath(`/${locale}/app/dashboard`)

    return {
      status: "success",
      message: "Purchased.",
      productId: parsed.data.productId,
      pointsRemaining: purchase.pointsRemaining,
    }
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Purchase failed.") }
  }
}
