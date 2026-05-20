import { setRequestLocale } from 'next-intl/server';
import { Locale } from '@/i18n';
import { MarketingHero } from '@/components/sections/MarketingHero';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { StatsSection } from '@/components/sections/StatsSection';
//import { AboutPreviewSection } from '@/components/sections/AboutPreviewSection';
import { Footer } from '@/components/navigation/Footer';
import { Testimonials } from '@/components/ui/unique-testimonial';

interface HomePageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen">
      <MarketingHero />
      <section id="how-it-works" className="scroll-mt-24">
        <FeaturesSection />
      </section>
      <StatsSection />
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <Testimonials />
        </div>
      </section>
      {/* <AboutPreviewSection /> */}
      <Footer />
    </main>
  );
}
