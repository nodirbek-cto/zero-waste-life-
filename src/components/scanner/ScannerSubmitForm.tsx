"use client"

import { useActionState } from "react"
import type { Locale } from "@/i18n"
import { submitScanAction, type SubmitScanState } from "@/app/[locale]/app/scanner/actions"

export function ScannerSubmitForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState<SubmitScanState, FormData>(
    submitScanAction,
    { status: "idle" }
  )

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input
        type="file"
        name="image"
        accept="image/*"
        required
        disabled={pending}
        className="block w-full text-sm"
      />

      {state.status === "error" ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      {state.status === "success" ? (
        <div className="rounded-xl bg-eco-50 px-3 py-2 text-sm text-eco-800">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  )
}

