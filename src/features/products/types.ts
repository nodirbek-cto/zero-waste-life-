import type { Tables } from "@/lib/database.types"
import type { ShopProduct as ServiceShopProduct } from "@/lib/services/products"

export type Product = Tables<"products">
export type Purchase = Tables<"purchases">
export type ShopProduct = ServiceShopProduct
