import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Inserts, Updates } from "@/lib/database.types"
import { AppError } from "./errors"
import { getSignedUrlCached } from "./storage"

export type ShopProduct = {
  id: string
  title: string
  description: string
  price: number
  image_url: string | null
  signedImageUrl: string | null
  created_at: string
  purchased: boolean
}

export async function listProducts(
  supabase: SupabaseClient<Database>,
  { page = 1, pageSize = 50 }: { page?: number; pageSize?: number } = {}
) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from("products")
    .select("id, title, description, price, image_url, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw new AppError("Failed to load products.", "PRODUCTS_LOAD_FAILED", error.message)
  return { data: data ?? [], count: count ?? 0, page, pageSize }
}

async function productImageUrlOrNull(supabase: SupabaseClient<Database>, path: string | null) {
  if (!path) return null

  try {
    return await getSignedUrlCached({ supabase, bucket: "products", path })
  } catch {
    return /^https?:\/\//i.test(path) ? path : null
  }
}

export async function listShopProducts(
  supabase: SupabaseClient<Database>,
  userId: string,
  { page = 1, pageSize = 50 }: { page?: number; pageSize?: number } = {}
) {
  const [{ data: products, count }, { data: purchases, error: purchasesError }] =
    await Promise.all([
      listProducts(supabase, { page, pageSize }),
      supabase.from("purchases").select("product_id").eq("user_id", userId),
    ])

  if (purchasesError) {
    throw new AppError("Failed to load purchases.", "PURCHASES_LOAD_FAILED", purchasesError.message)
  }

  const purchasedIds = new Set((purchases ?? []).map((purchase) => purchase.product_id))
  const data: ShopProduct[] = await Promise.all(
    products.map(async (product) => ({
      ...product,
      signedImageUrl: await productImageUrlOrNull(supabase, product.image_url),
      purchased: purchasedIds.has(product.id),
    }))
  )

  return { data, count, page, pageSize }
}

export async function buyProduct(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string
) {
  const [profileResult, productResult] = await Promise.all([
    supabase.from("profiles").select("points").eq("id", userId).maybeSingle(),
    supabase.from("products").select("price").eq("id", productId).maybeSingle(),
  ])

  if (profileResult.error) {
    throw new AppError("Failed to load points.", "POINTS_LOAD_FAILED", profileResult.error.message)
  }
  if (productResult.error) {
    throw new AppError("Failed to load product.", "PRODUCT_LOAD_FAILED", productResult.error.message)
  }
  if (!profileResult.data) throw new AppError("Profile not found.", "PROFILE_NOT_FOUND")
  if (!productResult.data) throw new AppError("Product not found.", "PRODUCT_NOT_FOUND")

  const points = profileResult.data.points
  const price = Number(productResult.data.price)
  if (!Number.isInteger(price) || price < 0) {
    throw new AppError("Product price must be whole points.", "INVALID_PRODUCT_PRICE")
  }
  if (points < price) throw new AppError("Not enough points.", "INSUFFICIENT_POINTS")

  const { data, error } = await supabase
    .rpc("buy_product", { p_user_id: userId, p_product_id: productId })
    .single()

  if (error) {
    const code = error.code === "23505" ? "DUPLICATE_PURCHASE" : "PURCHASE_FAILED"
    const message = error.code === "23505" ? "Product already purchased." : error.message
    throw new AppError(message, code, error.message)
  }

  return {
    purchaseId: data.purchase_id,
    pointsRemaining: data.points_remaining,
  }
}

export async function createProduct(supabase: SupabaseClient<Database>, values: Inserts<"products">) {
  const { data, error } = await supabase.from("products").insert(values).select("id").single()
  if (error) throw new AppError("Failed to create product.", "PRODUCT_CREATE_FAILED", error.message)
  return data.id
}

export async function updateProduct(supabase: SupabaseClient<Database>, id: string, values: Updates<"products">) {
  const { error } = await supabase.from("products").update(values).eq("id", id)
  if (error) throw new AppError("Failed to update product.", "PRODUCT_UPDATE_FAILED", error.message)
}

export async function deleteProduct(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new AppError("Failed to delete product.", "PRODUCT_DELETE_FAILED", error.message)
}
