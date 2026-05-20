"use client"

import { useActionState } from "react"
import type { Locale } from "@/i18n"
import { deleteScanResultAction, setScanResultAction, type ReviewState } from "@/app/[locale]/admin/actions"
import type { AdminScan } from "@/features/admin/types"

export function ScanReviewCard({
  locale,
  scan,
}: {
  locale: Locale
  scan: AdminScan
}) {
  const [setState, setAction, setPending] = useActionState<ReviewState, FormData>(setScanResultAction, {
    status: "idle",
  })
  const [delState, delAction, delPending] = useActionState<ReviewState, FormData>(deleteScanResultAction, {
    status: "idle",
  })
  const busy = setPending || delPending

  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">Scan</div>
          <div className="font-mono text-xs break-all">{scan.id}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            User: <span className="font-mono">{scan.user_id}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{new Date(scan.created_at).toLocaleString()}</div>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-3">
        <div className="text-xs text-muted-foreground mb-2">
          Private path: <span className="font-mono break-all">{scan.image_url}</span>
        </div>
        {scan.signedImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scan.signedImageUrl}
            alt="Submitted scan"
            className="h-56 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="rounded-lg border border-border px-3 py-8 text-center text-sm text-muted-foreground">
            Signed URL unavailable.
          </div>
        )}
      </div>

      {setState.status === "error" ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{setState.message}</div>
      ) : null}
      {setState.status === "success" ? (
        <div className="rounded-xl bg-eco-50 px-3 py-2 text-sm text-eco-800">{setState.message}</div>
      ) : null}
      {delState.status === "error" ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{delState.message}</div>
      ) : null}
      {delState.status === "success" ? (
        <div className="rounded-xl bg-eco-50 px-3 py-2 text-sm text-eco-800">{delState.message}</div>
      ) : null}

      <form action={setAction} className="space-y-2">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="scan_id" value={scan.id} />
        <textarea
          name="result_text"
          required
          defaultValue={scan.result_text ?? ""}
          placeholder="Result text (admin writes real classification/notes)"
          className="min-h-[90px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-eco-200 focus:border-eco-500"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-foreground text-background px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {setPending ? "Saving..." : "Save result"}
        </button>
      </form>

      <form action={delAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="scan_id" value={scan.id} />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
        >
          {delPending ? "Deleting..." : "Delete scan"}
        </button>
      </form>
    </div>
  )
}
