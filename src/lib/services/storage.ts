import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { AppError } from "./errors"

export type PrivateBucket = "scans" | "reports" | "products"

const FALLBACK_EXTENSION = "jpg"
const SIGNED_URL_TTL_SECONDS = 60
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>()

function extensionFromFile(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) return fromName

  const [, subtype] = file.type.split("/")
  if (subtype && /^[a-z0-9.+-]{1,16}$/.test(subtype)) {
    return subtype === "jpeg" ? "jpg" : subtype
  }

  return FALLBACK_EXTENSION
}

export function createPrivateStoragePath(userId: string, file: File) {
  return `${userId}/${crypto.randomUUID()}.${extensionFromFile(file)}`
}

function assertPrivatePath(userId: string, path: string) {
  const pattern = new RegExp(`^${userId}/[0-9a-f-]{36}\\.[a-z0-9.+-]{1,16}$`, "i")
  if (!pattern.test(path)) {
    throw new AppError("Invalid storage path.", "INVALID_STORAGE_PATH")
  }
}

export async function uploadFile({
  supabase,
  bucket,
  userId,
  file,
}: {
  supabase: SupabaseClient<Database>
  bucket: PrivateBucket
  userId: string
  file: File
}) {
  if (!file.type.startsWith("image/")) {
    throw new AppError("Only image files are allowed.", "INVALID_FILE")
  }

  if (file.size <= 0) {
    throw new AppError("Empty image file.", "INVALID_FILE")
  }

  const path = createPrivateStoragePath(userId, file)
  assertPrivatePath(userId, path)
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  })

  if (error) throw new AppError("Failed to upload file.", "STORAGE_UPLOAD_FAILED", error.message)
  return path
}

export async function getSignedUrlCached({
  supabase,
  bucket,
  path,
  expires = SIGNED_URL_TTL_SECONDS,
}: {
  supabase: SupabaseClient<Database>
  bucket: PrivateBucket
  path: string | null
  expires?: number
}) {
  if (!path) return null

  const cacheKey = `${bucket}:${path}:${expires}`
  const cached = signedUrlCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.url

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expires)

  if (error) throw new AppError("Failed to create signed URL.", "SIGNED_URL_FAILED", error.message)
  const expiresAt = Date.now() + Math.max(1, expires - 5) * 1000
  signedUrlCache.set(cacheKey, { url: data.signedUrl, expiresAt })
  return data.signedUrl
}

export async function deleteFile({
  supabase,
  bucket,
  path,
}: {
  supabase: SupabaseClient<Database>
  bucket: PrivateBucket
  path: string | null
}) {
  if (!path) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new AppError("Failed to delete file.", "STORAGE_DELETE_FAILED", error.message)
  for (const key of signedUrlCache.keys()) {
    if (key.startsWith(`${bucket}:${path}:`)) signedUrlCache.delete(key)
  }
}
