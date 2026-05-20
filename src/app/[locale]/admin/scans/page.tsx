import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ScanReviewCard } from "@/components/admin/ScanReviewCard"
import { listAdminScans } from "@/features/admin/api"
import { toUserMessage } from "@/lib/services/errors"

function pageFrom(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export default async function AdminScansPage({
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

  let result: Awaited<ReturnType<typeof listAdminScans>> = { data: [], count: 0, page, pageSize }
  let error: string | null = null
  try {
    result = await listAdminScans(supabase, { page, pageSize })
  } catch (err) {
    error = toUserMessage(err, "Failed to load scans.")
  }
  const hasPrevious = page > 1
  const hasNext = page * pageSize < result.count

  if (error) {
    return (
      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-red-600">Failed to load: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Scans</h2>
        <p className="text-muted-foreground text-sm">
          Total scans: {result.count}
        </p>
      </div>

      {result.data.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.data.map((s) => (
            <ScanReviewCard key={s.id} locale={locale} scan={s} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
          No scans yet.
        </div>
      )}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} of {Math.max(1, Math.ceil(result.count / pageSize))}
        </span>
        <div className="flex gap-2">
          {hasPrevious ? (
            <a className="rounded-xl border border-border px-3 py-2" href={`/${locale}/admin/scans?page=${page - 1}`}>
              Previous
            </a>
          ) : null}
          {hasNext ? (
            <a className="rounded-xl border border-border px-3 py-2" href={`/${locale}/admin/scans?page=${page + 1}`}>
              Next
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
