import { getRequestConfig } from "next-intl/server"

const locales = ["en", "uz", "ru"] as const
type Locale = (typeof locales)[number]
const defaultLocale: Locale = "en"

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale: Locale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale

  return {
    locale: resolvedLocale,
    messages: (await import(`../src/messages/${resolvedLocale}.json`)).default,
  }
})

