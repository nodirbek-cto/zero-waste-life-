import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ProductAdminForm } from "@/components/admin/products/ProductAdminForm"
import { toUserMessage } from "@/lib/services/errors"
import { listProducts } from "@/lib/services/products"

function pageFrom(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale: rawLocale } = await params
  const { page: rawPage } = await searchParams
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  setRequestLocale(locale)

  const supabase = await createSupabaseServerClient()
  const page = pageFrom(rawPage)
  const pageSize = 20
  const result = await listProducts(supabase, { page, pageSize }).catch((error) => ({
    error: toUserMessage(error, "Failed to load products."),
    data: [],
    count: 0,
    page,
    pageSize,
  }))
  const hasPrevious = page > 1
  const hasNext = page * pageSize < result.count

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Products</h2>
        <p className="text-sm text-muted-foreground">Create, update and delete products.</p>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">Create product</div>
        <ProductAdminForm locale={locale} />
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">Existing products</div>
        {"error" in result ? (
          <div className="text-sm text-red-600">{result.error}</div>
        ) : result.data.length ? (
          <div className="space-y-2">
            {result.data.map((p) => (
              <div key={p.id} className="space-y-3 rounded-xl border border-border px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{p.id}</div>
                  </div>
                  <ProductAdminForm locale={locale} deleteId={p.id} />
                </div>
                <ProductAdminForm locale={locale} product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No products.</div>
        )}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {Math.max(1, Math.ceil(result.count / pageSize))}
          </span>
          <div className="flex gap-2">
            {hasPrevious ? (
              <a className="rounded-xl border border-border px-3 py-2" href={`/${locale}/admin/products?page=${page - 1}`}>
                Previous
              </a>
            ) : null}
            {hasNext ? (
              <a className="rounded-xl border border-border px-3 py-2" href={`/${locale}/admin/products?page=${page + 1}`}>
                Next
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
