import type { Tables } from "@/lib/database.types"

export type ScanResult = Tables<"scan_results">
export type ScanWithSignedUrl = ScanResult & { signedImageUrl: string | null }
