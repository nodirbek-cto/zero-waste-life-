"use client"

import { useActionState } from "react"
import type { Locale } from "@/i18n"
import { updateProfileAction, type UpdateProfileState } from "./actions"

export function ProfileForm({
  locale,
  initial,
}: {
  locale: Locale
  initial: { full_name: string; avatar_url: string }
}) {
  const [state, formAction, pending] = useActionState<UpdateProfileState, FormData>(
    updateProfileAction,
    { status: "idle" }
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      {state.status === "error" ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="rounded-xl bg-eco-50 px-4 py-3 text-sm text-eco-800">
          {state.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full name</label>
          <input
            name="full_name"
            defaultValue={initial.full_name}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-eco-200 focus:border-eco-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Avatar URL</label>
          <input
            name="avatar_url"
            defaultValue={initial.avatar_url}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-eco-200 focus:border-eco-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-xl bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  )
}

