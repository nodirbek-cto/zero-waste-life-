import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ReportForm } from "@/components/report/ReportForm"
import { getVerifiedUser } from "@/lib/services/auth"
import { listUserReports } from "@/features/reports/api"

export default async function ReportPage({
  params,
}: {
  params: { locale: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale
  setRequestLocale(locale)
  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)

  let reports: Awaited<ReturnType<typeof listUserReports>> = []
  let error: string | null = null
  if (user) {
    try {
      reports = await listUserReports(supabase, user.id)
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load reports."
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Report</h1>
        <p className="text-muted-foreground">Submit a report. Admin will review it.</p>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">New report</div>
        <ReportForm locale={locale} />
        <div className="mt-3 text-xs text-muted-foreground">
          Images are stored privately and displayed with short-lived signed URLs.
        </div>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">Your reports</div>
        {error ? (
          <div className="text-sm text-red-600">Failed to load: {error}</div>
        ) : reports?.length ? (
          <div className="space-y-2">
            {reports.map((r) => (
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
