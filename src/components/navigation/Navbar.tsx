'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, Globe } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'home' },
  { href: '/how-it-works', label: 'howItWorks' },
  { href: '/about', label: 'aboutUs' },
];

const locales = [
  { code: 'en', label: 'English' },
  { code: 'uz', label: 'O\'zbek' },
  { code: 'ru', label: 'Русский' },
];

export function Navbar() {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-eco-600 flex items-center justify-center
                          group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-xl transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              Zero Waste
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className={`text-sm font-medium transition-colors hover:text-eco-600 ${
                  isScrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t(link.label)}
              </Link>
            ))}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  isScrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                <Globe className="w-4 h-4" />
                {locale.toUpperCase()}
              </button>
              
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl py-2 min-w-[140px]"
                  >
                    {locales.map((l) => (
                      <Link
                        key={l.code}
                        href={pathname.replace(`/${locale}`, `/${l.code}`)}
                        className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          locale === l.code ? 'text-eco-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href={`/${locale}/signin`}
              className={`text-sm font-medium transition-colors hover:text-eco-600 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {t('signIn')}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="btn-primary text-sm"
            >
              {t('signUp')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="section-padding py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 font-medium"
                >
                  {t(link.label)}
                </Link>
              ))}
              <div className="pt-4 border-t space-y-3">
                <Link
                  href={`/${locale}/signin`}
                  className="block text-gray-700 font-medium"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href={`/${locale}/signup`}
                  className="btn-primary w-full text-center"
                >
                  {t('signUp')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
