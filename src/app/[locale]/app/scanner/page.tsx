import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ScannerSubmitForm } from "@/components/scanner/ScannerSubmitForm"
import { getVerifiedUser } from "@/lib/services/auth"
import { listUserScans } from "@/features/scanner/api"

export default async function ScannerPage({
  params,
}: {
  params: { locale: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale
  setRequestLocale(locale)
  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)

  const latest = user ? await listUserScans(supabase, user.id) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scanner</h1>
        <p className="text-muted-foreground">
          Upload a photo. It will be reviewed by an admin before points are awarded.
        </p>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">Submit a scan</div>
        <ScannerSubmitForm locale={locale} />
        <div className="mt-3 text-xs text-muted-foreground">Images are stored privately and displayed with short-lived signed URLs.</div>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-3">Recent submissions</div>
        {latest?.length ? (
          <div className="space-y-2">
            {latest.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs break-all">{s.id}</div>
                  <div className="mt-1 text-sm">{s.result_text ?? "PENDING"}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span>{s.status === "done" || s.result_text ? "READY" : "PENDING"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No submissions yet.</div>
        )}
      </div>
    </div>
  )
}
