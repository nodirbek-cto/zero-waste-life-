import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Json } from "@/lib/database.types"
import { AppError } from "./errors"

export type AuditAction =
  | "scan_result.update"
  | "report_status.update"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "location.create"
  | "location.update"
  | "location.delete"

export async function logAction(
  supabase: SupabaseClient<Database>,
  userId: string,
  action: AuditAction,
  entity: { type: string; id: string; metadata?: Json }
) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: userId,
    action,
    entity_type: entity.type,
    entity_id: entity.id,
    metadata: entity.metadata ?? null,
  })

  if (error) throw new AppError("Failed to write audit log.", "AUDIT_LOG_FAILED", error.message)
}
