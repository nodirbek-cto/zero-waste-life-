"use client"

import { useActionState } from "react"
import type { Locale } from "@/i18n"
import { updateReportStatusAction, type ReviewState } from "@/app/[locale]/admin/actions"
import type { AdminReport } from "@/features/admin/types"

export function ReportReviewCard({ locale, report }: { locale: Locale; report: AdminReport }) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(updateReportStatusAction, {
    status: "idle",
  })

  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{report.title}</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono break-all">{report.id}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            User: <span className="font-mono">{report.user_id}</span>
          </div>
        </div>
        <div className="rounded-full border border-border px-2 py-1 text-xs uppercase">{report.status}</div>
      </div>

      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>

      {report.image_url ? (
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <div className="text-xs text-muted-foreground mb-2">
            Private path: <span className="font-mono break-all">{report.image_url}</span>
          </div>
          {report.signedImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={report.signedImageUrl} alt="Report attachment" className="h-56 w-full rounded-lg object-cover" />
          ) : (
            <div className="rounded-lg border border-border px-3 py-8 text-center text-sm text-muted-foreground">
              Signed URL unavailable.
            </div>
          )}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div>
      ) : null}
      {state.status === "success" ? (
        <div className="rounded-xl bg-eco-50 px-3 py-2 text-sm text-eco-800">{state.message}</div>
      ) : null}

      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="report_id" value={report.id} />
        <select
          name="status"
          defaultValue={report.status === "resolved" ? "resolved" : "reviewed"}
          disabled={pending}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-foreground text-background px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Saving..." : "Update status"}
        </button>
      </form>
    </div>
  )
}
