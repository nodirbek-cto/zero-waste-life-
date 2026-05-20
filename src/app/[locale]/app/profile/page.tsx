import { setRequestLocale } from "next-intl/server"
import { defaultLocale, isLocale, type Locale } from "@/i18n"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { getVerifiedUser } from "@/lib/services/auth"
import { getProfileById } from "@/lib/services/profile"

export default async function ProfilePage({
  params,
}: {
  params: { locale: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale
  setRequestLocale(locale)
  const supabase = await createSupabaseServerClient()
  const user = await getVerifiedUser(supabase)

  const profile = user ? await getProfileById(supabase, user.id) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">{profile?.email ?? user?.email ?? "Unknown user"}</p>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-1">User ID</div>
        <div className="font-mono text-sm break-all">{user?.id}</div>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="text-sm text-muted-foreground mb-4">Public profile</div>
        <ProfileForm
          locale={locale}
          initial={{
            full_name: profile?.full_name ?? "",
            avatar_url: profile?.avatar_url ?? "",
          }}
        />
      </div>
    </div>
  )
}
