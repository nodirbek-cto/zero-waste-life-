import { redirect } from "next/navigation"
import { defaultLocale, isLocale, type Locale } from "@/i18n"

export default async function DashboardAlias({
  params,
}: {
  params: { locale: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale
  redirect(`/${locale}/app/dashboard`)
}

