"use client"

import { useActionState } from "react"
import type { Locale } from "@/i18n"
import {
  createLocationAction,
  deleteLocationAction,
  updateLocationAction,
  type AdminState,
} from "@/app/[locale]/admin/locations/actions"
import type { Location } from "@/features/map/types"

export function LocationAdminForm({
  locale,
  deleteId,
  location,
}: {
  locale: Locale
  deleteId?: string
  location?: Location
}) {
  const [createState, createAction, createPending] = useActionState<AdminState, FormData>(createLocationAction, {
    status: "idle",
  })
  const [updateState, updateAction, updatePending] = useActionState<AdminState, FormData>(updateLocationAction, {
    status: "idle",
  })
  const [delState, delAction, delPending] = useActionState<AdminState, FormData>(deleteLocationAction, {
    status: "idle",
  })

  if (deleteId) {
    return (
      <form action={delAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={deleteId} />
        <button
          type="submit"
          disabled={delPending}
          className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-50"
        >
          {delPending ? "Deleting..." : "Delete"}
        </button>
        {delState.status === "error" ? <div className="mt-2 text-xs text-red-600">{delState.message}</div> : null}
      </form>
    )
  }

  if (location) {
    return (
      <form action={updateAction} className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl border border-border p-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={location.id} />
        <input
          name="name"
          required
          defaultValue={location.name}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          disabled={updatePending}
        />
        <input
          name="latitude"
          required
          type="number"
          step="0.000001"
          min={-90}
          max={90}
          defaultValue={location.latitude}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          disabled={updatePending}
        />
        <input
          name="longitude"
          required
          type="number"
          step="0.000001"
          min={-180}
          max={180}
          defaultValue={location.longitude}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          disabled={updatePending}
        />
        <button
          type="submit"
          disabled={updatePending}
          className="rounded-xl bg-foreground text-background px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {updatePending ? "Saving..." : "Save"}
        </button>
        <textarea
          name="description"
          required
          defaultValue={location.description}
          className="md:col-span-4 min-h-[70px] rounded-xl border border-border bg-background px-3 py-2 text-sm"
          disabled={updatePending}
        />
        {updateState.status === "error" ? (
          <div className="md:col-span-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {updateState.message}
          </div>
        ) : null}
        {updateState.status === "success" ? (
          <div className="md:col-span-4 rounded-xl bg-eco-50 px-3 py-2 text-sm text-eco-800">
            {updateState.message}
          </div>
        ) : null}
      </form>
    )
  }

  return (
    <form action={createAction} className="grid grid-cols-1 md:grid-cols-4 gap-2">
      <input type="hidden" name="locale" value={locale} />
      <input
        name="name"
        required
        placeholder="Name"
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        disabled={createPending}
      />
      <input
        name="latitude"
        required
        type="number"
        step="0.000001"
        min={-90}
        max={90}
        placeholder="Latitude"
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        disabled={createPending}
      />
      <input
        name="longitude"
        required
        type="number"
        step="0.000001"
        min={-180}
        max={180}
        placeholder="Longitude"
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        disabled={createPending}
      />
      <button
        type="submit"
        disabled={createPending}
        className="rounded-xl bg-foreground text-background px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {createPending ? "Creating..." : "Create"}
      </button>
      <textarea
        name="description"
        required
        placeholder="Description"
        className="md:col-span-4 min-h-[90px] rounded-xl border border-border bg-background px-3 py-2 text-sm"
        disabled={createPending}
      />
      {createState.status === "error" ? (
        <div className="md:col-span-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{createState.message}</div>
      ) : null}
      {createState.status === "success" ? (
        <div className="md:col-span-4 rounded-xl bg-eco-50 px-3 py-2 text-sm text-eco-800">
          {createState.message}
        </div>
      ) : null}
    </form>
  )
}
