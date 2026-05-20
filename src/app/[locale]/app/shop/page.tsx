import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { ShopGrid } from "@/components/shop/ShopGrid"
import { getVerifiedUser } from "@/lib/services/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { toUserMessage } from "@/lib/services/errors"
import { getProfileById } from "@/lib/services/profile"
import { listShopProducts } from "@/lib/services/products"

export default async function ShopPage({
  params,
}: {
  params: { locale: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale
  setRequestLocale(locale)
  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)

  if (!user) {
    return (
      <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
        You must be signed in to use the shop.
      </div>
    )
  }

  const [profile, result] = await Promise.all([
    getProfileById(supabase, user.id),
    listShopProducts(supabase, user.id, { pageSize: 50 }).catch((error) => ({
      error: toUserMessage(error, "Failed to load products."),
      data: [],
    })),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
        <p className="text-muted-foreground">Redeem your points for available products.</p>
      </div>

      {"error" in result ? (
        <div className="rounded-lg border border-border p-4 text-sm text-red-600">
          {result.error}
        </div>
      ) : result.data.length ? (
        <ShopGrid locale={locale} initialPoints={profile?.points ?? 0} products={result.data} />
      ) : (
        <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          No products yet.
        </div>
      )}
    </div>
  )
}
