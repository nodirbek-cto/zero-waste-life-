"use client"

import { useActionState } from "react"
import type { Locale } from "@/i18n"
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
  type AdminState,
} from "@/app/[locale]/admin/products/actions"
import type { Product } from "@/features/products/types"

export function ProductAdminForm({
  locale,
  deleteId,
  product,
}: {
  locale: Locale
  deleteId?: string
  product?: Product
}) {
  const [createState, createAction, createPending] = useActionState<AdminState, FormData>(createProductAction, {
    status: "idle",
  })
  const [updateState, updateAction, updatePending] = useActionState<AdminState, FormData>(updateProductAction, {
    status: "idle",
  })
  const [delState, delAction, delPending] = useActionState<AdminState, FormData>(deleteProductAction, {
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
        {delState.status === "error" ? (
          <div className="mt-2 text-xs text-red-600">{delState.message}</div>
        ) : null}
      </form>
    )
  }

  if (product) {
    return (
      <form action={updateAction} className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl border border-border p-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={product.id} />
        <input
          name="title"
          required
          defaultValue={product.title}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          disabled={updatePending}
        />
        <input
          name="price"
          required
          type="number"
          min={0}
          step="1"
          defaultValue={product.price}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          disabled={updatePending}
        />
        <input
          name="image_url"
          defaultValue={product.image_url ?? ""}
          placeholder="Image URL"
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
          defaultValue={product.description}
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
        name="title"
        required
        placeholder="Title"
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        disabled={createPending}
      />
      <input
        name="price"
        required
          type="number"
          min={0}
          step="1"
        placeholder="Price"
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        disabled={createPending}
      />
      <input
        name="image_url"
        placeholder="Product image path (optional)"
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
        <div className="md:col-span-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {createState.message}
        </div>
      ) : null}
      {createState.status === "success" ? (
        <div className="md:col-span-4 rounded-xl bg-eco-50 px-3 py-2 text-sm text-eco-800">
          {createState.message}
        </div>
      ) : null}
    </form>
  )
}
