"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  ScanLine,
  Map,
  ShoppingBag,
  FileText,
  User,
  Leaf,
  LogOut,
  Shield,
} from "lucide-react"
import { signOutAction } from "@/app/[locale]/(auth)/actions"

const items = [
  { href: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/app/scanner", label: "Scanner", icon: ScanLine },
  { href: "/app/map", label: "Map", icon: Map },
  { href: "/app/shop", label: "Shop", icon: ShoppingBag },
  { href: "/app/report", label: "Report", icon: FileText },
  { href: "/app/profile", label: "Profile", icon: User },
]

export function AppShell({
  locale,
  isAdmin = false,
  children,
}: {
  locale: string
  isAdmin?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-foreground text-background flex items-center justify-center">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm text-muted-foreground">Zero Waste Life</div>
              <div className="font-semibold">App</div>
            </div>
          </div>

          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="rounded-2xl border border-border bg-background/60 backdrop-blur p-3">
            <nav className="space-y-1">
              {items.map((it) => {
                const target = `/${locale}${it.href}`
                const active = pathname === target
                const Icon = it.icon
                return (
                  <Link
                    key={it.href}
                    href={target}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                )
              })}

              {isAdmin ? (
                <Link
                  href={`/${locale}/admin/scans`}
                  className={cn(
                    "mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    pathname.startsWith(`/${locale}/admin`)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}
            </nav>
          </aside>

          <section className="rounded-2xl border border-border bg-background/60 backdrop-blur p-5">
            {children}
          </section>
        </div>
      </div>
    </div>
  )
}

