import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { toUserMessage } from "@/lib/services/errors"
import { listLocations } from "@/lib/services/locations"

export default async function MapPage({
  params,
}: {
  params: { locale: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale
  setRequestLocale(locale)
  const supabase = await createSupabaseServerClient()

  const result = await listLocations(supabase, { pageSize: 200 }).catch((error) => ({
    error: toUserMessage(error, "Failed to load locations."),
    data: [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Map</h1>
        <p className="text-muted-foreground">Locations are loaded from database.</p>
      </div>

      {"error" in result ? (
        <div className="rounded-2xl border border-border p-4 text-sm text-red-600">
          {result.error}
        </div>
      ) : result.data.length ? (
        <div className="space-y-2">
          {result.data.map((l) => (
            <div key={l.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-muted-foreground">{l.description}</div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {l.latitude.toFixed(6)}, {l.longitude.toFixed(6)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border p-6 text-sm text-muted-foreground">
          No locations yet.
        </div>
      )}
    </div>
  )
}
