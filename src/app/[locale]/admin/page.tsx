import { redirect } from "next/navigation"
import type { Locale } from "@/i18n"

export default async function AdminIndex({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale as Locale}/admin/scans`)
}
