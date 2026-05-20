import { redirect } from "next/navigation"
import { defaultLocale, isLocale, type Locale } from "@/i18n"

export default async function ShopAlias({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  redirect(`/${locale}/app/shop`)
}

