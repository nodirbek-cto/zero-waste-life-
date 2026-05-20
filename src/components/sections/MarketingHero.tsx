"use client"

import { AnimatedHero } from "@/components/ui/animated-hero-section-1"
import { Button } from "@/components/ui/button"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Leaf } from "lucide-react"

export function MarketingHero() {
  const t = useTranslations("hero")
  const tNav = useTranslations("navigation")
  const locale = useLocale()
  const router = useRouter()

  const navLinks = [
    { label: tNav("home"), href: "#home" },
    { label: tNav("howItWorks"), href: "#how-it-works" },
    { label: tNav("aboutUs"), href: "#about-us" },
  ]

  return (
    <div id="home" className="scroll-mt-24">
      <AnimatedHero
        backgroundImageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2940&q=80"
        logo={
          <>
            <Leaf className="h-6 w-6 text-primary-foreground" />
            <span className="font-semibold text-primary-foreground">
              Zero Waste Life
            </span>
          </>
        }
        navLinks={navLinks}
        topRightAction={
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push(`/${locale}/signin`)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-primary-foreground hover:bg-white/20"
            >
              {tNav("signIn")}
            </Button>
            <Button
              onClick={() => router.push(`/${locale}/signup`)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-primary-foreground hover:bg-white/20"
            >
              {tNav("signUp")}
            </Button>
          </div>
        }
        title={`${t("title")} ${t("titleHighlight")}`}
        description={t("subtitle")}
        ctaButton={{
          text: t("ctaPrimary"),
          onClick: () => {
            document.getElementById("how-it-works")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          },
        }}
        secondaryCta={{
          text: t("ctaSecondary"),
          onClick: () => router.push(`/${locale}/signin`),
        }}
      />
    </div>
  )
}

