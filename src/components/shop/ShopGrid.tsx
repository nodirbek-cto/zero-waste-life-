"use client"

import { useActionState, useCallback, useEffect, useState } from "react"
import type { Locale } from "@/i18n"
import type { ShopProduct } from "@/features/products/types"
import {
  buyProductAction,
  type BuyProductState,
} from "@/app/[locale]/app/shop/actions"

function ProductPurchaseForm({
  locale,
  product,
  points,
  onPurchased,
}: {
  locale: Locale
  product: ShopProduct
  points: number
  onPurchased: (productId: string, pointsRemaining: number) => void
}) {
  const [state, formAction, pending] = useActionState<BuyProductState, FormData>(
    buyProductAction,
    { status: "idle" }
  )
  const [purchased, setPurchased] = useState(product.purchased)
  const price = Number(product.price)
  const canAfford = points >= price

  useEffect(() => {
    if (state.status !== "success") return

    setPurchased(true)
    onPurchased(state.productId, state.pointsRemaining)
  }, [onPurchased, state])

  const disabled = pending || purchased || !canAfford
  const label = purchased ? "Purchased" : pending ? "Buying..." : canAfford ? "Buy" : "Not enough points"

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="productId" value={product.id} />
      <button
        type="submit"
        disabled={disabled}
        className="h-10 w-full rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {label}
      </button>
      {state.status === "error" ? (
        <div className="text-xs text-red-600">{state.message}</div>
      ) : null}
      {state.status === "success" ? (
        <div className="text-xs text-eco-700">{state.message}</div>
      ) : null}
    </form>
  )
}

export function ShopGrid({
  locale,
  initialPoints,
  products,
}: {
  locale: Locale
  initialPoints: number
  products: ShopProduct[]
}) {
  const [points, setPoints] = useState(initialPoints)
  const [purchasedIds, setPurchasedIds] = useState(() => new Set(
    products.filter((product) => product.purchased).map((product) => product.id)
  ))

  const handlePurchased = useCallback((productId: string, pointsRemaining: number) => {
    setPoints(pointsRemaining)
    setPurchasedIds((current) => new Set(current).add(productId))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <span className="text-sm text-muted-foreground">Your points</span>
        <span className="text-lg font-semibold tabular-nums">{points}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-lg border border-border bg-background"
          >
            {product.signedImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.signedImageUrl}
                alt={product.title}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                No image
              </div>
            )}
            <div className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium leading-tight">{product.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </div>
                <div className="shrink-0 text-sm font-semibold tabular-nums">
                  {Number(product.price).toFixed(0)}
                </div>
              </div>
              <ProductPurchaseForm
                locale={locale}
                product={{ ...product, purchased: purchasedIds.has(product.id) }}
                points={points}
                onPurchased={handlePurchased}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
