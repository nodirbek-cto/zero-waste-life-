import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getVerifiedUser } from "@/lib/services/auth"
import { getDashboardSummary, type DashboardSummary } from "@/lib/services/dashboard"
import { toUserMessage } from "@/lib/services/errors"

type DashboardResult = DashboardSummary | (DashboardSummary & { loadError: string })

export default async function DashboardPage({
  params,
}: {
  params: { locale: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale
  setRequestLocale(locale)
  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)

  const summary: DashboardResult = user
    ? await getDashboardSummary(supabase, user.id).catch((error) => ({
        loadError: toUserMessage(error, "Failed to load dashboard."),
        scansCount: 0,
        reportsCount: 0,
        recentReports: [],
      }))
    : { scansCount: 0, reportsCount: 0, recentReports: [] }
  const loadError =
    "loadError" in summary && typeof summary.loadError === "string"
      ? summary.loadError
      : null

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted-foreground">Welcome back</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user?.email ?? "Dashboard"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total reports", value: String(summary.reportsCount) },
          { label: "Total scans", value: String(summary.scansCount) },
          { label: "Account", value: user?.email ?? "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-background p-4"
          >
            <div className="text-sm text-muted-foreground">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">Recent reports</div>
        {loadError ? (
          <div className="text-sm text-red-600">{loadError}</div>
        ) : summary.recentReports.length ? (
          <div className="space-y-2">
            {summary.recentReports.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <div className="truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground uppercase">{r.status}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No reports yet.</div>
        )}
      </div>
    </div>
  )
}
