import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app/AppShell"
import { getCurrentRole, getVerifiedUser } from "@/lib/services/auth"

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  setRequestLocale(locale)

  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)

  if (!user) {
    redirect(`/${locale}/signin`)
  }

  const role = await getCurrentRole(supabase)

  return (
    <AppShell locale={locale} isAdmin={role === "admin"}>
      {children}
    </AppShell>
  )
}
