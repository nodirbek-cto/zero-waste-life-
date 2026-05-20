import type { Tables } from "@/lib/database.types"

export type Report = Tables<"reports">
export type ReportWithSignedUrl = Report & { signedImageUrl: string | null }
