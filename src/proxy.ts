import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware"
import { getCurrentRole, getVerifiedUser } from "@/lib/services/auth"

const intl = createMiddleware({
  locales: ["en", "uz", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})

const locales = ["en", "uz", "ru"] as const
const defaultLocale = "en"

function getRouteContext(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split("/")
  const hasLocale = locales.includes(maybeLocale as (typeof locales)[number])
  const locale = hasLocale ? maybeLocale : defaultLocale
  const route = `/${(hasLocale ? rest : [maybeLocale, ...rest]).filter(Boolean).join("/")}`

  return { locale, route: route === "/" ? "/" : route }
}

function redirectTo(request: NextRequest, path: string) {
  const url = request.nextUrl.clone()
  url.pathname = path
  url.search = ""
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  // Keep Supabase session cookies in sync (required for SSR auth)
  const { supabase, response: supabaseResponse } = createSupabaseMiddlewareClient(request)
  const { locale, route } = getRouteContext(request.nextUrl.pathname)

  const user = await getVerifiedUser(supabase)

  if (route.startsWith("/app") && !user) {
    return redirectTo(request, `/${locale}/signin`)
  }

  if (route.startsWith("/admin")) {
    if (!user) {
      return redirectTo(request, `/${locale}/signin`)
    }

    const role = await getCurrentRole(supabase)
    if (role !== "admin") {
      return redirectTo(request, `/${locale}/app/dashboard`)
    }
  }

  // Apply i18n routing/validation
  const response = intl(request)

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Merge Supabase cookie mutations into the final response
  supabaseResponse.headers.forEach((value, key) => {
    response.headers.set(key, value)
  })
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie)
  })

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|images).*)"],
}
