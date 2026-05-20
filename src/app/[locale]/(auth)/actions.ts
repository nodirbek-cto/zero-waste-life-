"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { locales, type Locale, defaultLocale } from "@/i18n"
import { signInWithPassword, signOut, signUpWithPassword } from "@/lib/services/auth"
import { toUserMessage } from "@/lib/services/errors"

function coerceLocale(value: unknown): Locale {
  const l = typeof value === "string" ? value : ""
  return locales.includes(l as Locale) ? (l as Locale) : defaultLocale
}

const signInSchema = z.object({
  locale: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(1),
})

export type SignInState =
  | { status: "idle" }
  | { status: "error"; message: string }

export async function signInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)

  if (!parsed.success) {
    return { status: "error", message: "Please check your inputs and try again." }
  }

  const supabase = await createSupabaseServerClient()
  try {
    await signInWithPassword(supabase, {
      email: parsed.data.email,
      password: parsed.data.password,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Invalid email or password.") }
  }

  redirect(`/${locale}/app/dashboard`)
}

const signUpSchema = z.object({
  locale: z.string().optional(),
  full_name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(72),
})

export type SignUpState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData))
  const locale = coerceLocale(parsed.success ? parsed.data.locale : undefined)

  if (!parsed.success) {
    return { status: "error", message: "Please check your inputs and try again." }
  }

  const supabase = await createSupabaseServerClient()
  let data: Awaited<ReturnType<typeof signUpWithPassword>>
  try {
    data = await signUpWithPassword(supabase, {
      email: parsed.data.email,
      password: parsed.data.password,
      fullName: parsed.data.full_name,
    })
  } catch (error) {
    return { status: "error", message: toUserMessage(error, "Failed to create account.") }
  }

  if (data.session) {
    redirect(`/${locale}/app/dashboard`)
  }

  return {
    status: "success",
    message:
      "Account created. Please check your email to confirm your account, then sign in.",
  }
}

export async function signOutAction(formData: FormData) {
  const locale = coerceLocale(formData.get("locale"))
  const supabase = await createSupabaseServerClient()
  await signOut(supabase)
  redirect(`/${locale}`)
}
