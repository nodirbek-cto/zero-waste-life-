import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { LocationAdminForm } from "@/components/admin/locations/LocationAdminForm"
import { toUserMessage } from "@/lib/services/errors"
import { listLocations } from "@/lib/services/locations"

function pageFrom(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export default async function AdminLocationsPage({
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
  const result = await listLocations(supabase, { page, pageSize }).catch((error) => ({
    error: toUserMessage(error, "Failed to load locations."),
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
        <h2 className="text-xl font-semibold tracking-tight">Locations</h2>
        <p className="text-sm text-muted-foreground">Create, update and delete locations.</p>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">Create location</div>
        <LocationAdminForm locale={locale} />
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">Existing locations</div>
        {"error" in result ? (
          <div className="text-sm text-red-600">{result.error}</div>
        ) : result.data.length ? (
          <div className="space-y-2">
            {result.data.map((l) => (
              <div key={l.id} className="space-y-3 rounded-xl border border-border px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{l.name}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{l.id}</div>
                  </div>
                  <LocationAdminForm locale={locale} deleteId={l.id} />
                </div>
                <LocationAdminForm locale={locale} location={l} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No locations.</div>
        )}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {Math.max(1, Math.ceil(result.count / pageSize))}
          </span>
          <div className="flex gap-2">
            {hasPrevious ? (
              <a className="rounded-xl border border-border px-3 py-2" href={`/${locale}/admin/locations?page=${page - 1}`}>
                Previous
              </a>
            ) : null}
            {hasNext ? (
              <a className="rounded-xl border border-border px-3 py-2" href={`/${locale}/admin/locations?page=${page + 1}`}>
                Next
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
