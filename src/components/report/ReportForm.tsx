"use client"

import { useActionState } from "react"
import type { Locale } from "@/i18n"
import { submitReportAction, type SubmitReportState } from "@/app/[locale]/app/report/actions"

export function ReportForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState<SubmitReportState, FormData>(submitReportAction, {
    status: "idle",
  })

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          name="title"
          required
          minLength={3}
          maxLength={120}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-eco-200 focus:border-eco-500"
          placeholder="Short summary"
          disabled={pending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={4000}
          className="min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-eco-200 focus:border-eco-500"
          placeholder="What happened? Where? Any details that help resolving it."
          disabled={pending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image (optional)</label>
        <input type="file" name="image" accept="image/*" disabled={pending} className="block w-full text-sm" />
      </div>

      {state.status === "error" ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div>
      ) : null}
      {state.status === "success" ? (
        <div className="rounded-xl bg-eco-50 px-3 py-2 text-sm text-eco-800">{state.message}</div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit report"}
      </button>
    </form>
  )
}

