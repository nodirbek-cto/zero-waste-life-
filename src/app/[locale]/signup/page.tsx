'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useActionState } from 'react';
import { signUpAction, type SignUpState } from '@/app/[locale]/(auth)/actions';

export default function SignUpPage() {
  const t = useTranslations('auth.signUp');
  const locale = useLocale();

  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(
    signUpAction,
    { status: 'idle' }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 to-white flex items-center justify-center section-padding py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-eco-600 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">Zero Waste</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-center text-gray-600 mb-8">{t('subtitle')}</p>

          {state.status === 'error' && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              {state.message}
            </div>
          )}

          {state.status === 'success' && (
            <div className="mb-4 p-4 bg-eco-50 text-eco-700 rounded-xl text-sm">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="locale" value={locale} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('name')}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="full_name"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-200 outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-200 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-200 outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {pending ? 'Creating account...' : t('submit')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            {t('hasAccount')}{' '}
            <Link
              href={`/${locale}/signin`}
              className="text-eco-600 font-medium hover:underline"
            >
              {t('signInLink')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

