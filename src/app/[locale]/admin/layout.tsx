import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentRole, getVerifiedUser } from "@/lib/services/auth"

export default async function AdminLayout({
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

  if (!user) redirect(`/${locale}/signin`)

  const role = await getCurrentRole(supabase)
  if (role !== "admin") {
    redirect(`/${locale}/app/dashboard`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-muted-foreground">Manage production data</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a
              href={`/${locale}/admin/products`}
              className="rounded-xl border border-border px-3 py-2 hover:bg-muted/60"
            >
              Products
            </a>
            <a
              href={`/${locale}/admin/locations`}
              className="rounded-xl border border-border px-3 py-2 hover:bg-muted/60"
            >
              Locations
            </a>
            <a
              href={`/${locale}/admin/scans`}
              className="rounded-xl border border-border px-3 py-2 hover:bg-muted/60"
            >
              Scans
            </a>
            <a
              href={`/${locale}/admin/reports`}
              className="rounded-xl border border-border px-3 py-2 hover:bg-muted/60"
            >
              Reports
            </a>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
