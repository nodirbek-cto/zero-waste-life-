'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Camera, Gift, Trophy } from 'lucide-react';

const features = [
  { icon: Camera, key: 'scan', color: 'from-blue-500 to-cyan-400' },
  { icon: Trophy, key: 'earn', color: 'from-eco-500 to-emerald-400' },
  { icon: Gift, key: 'redeem', color: 'from-purple-500 to-pink-400' },
];

export function FeaturesSection() {
  const t = useTranslations('features');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-white section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="heading-lg text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative"
            >
              <div className="relative bg-gray-50 rounded-3xl p-8 lg:p-10 transition-all duration-500
                            group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-eco-100
                            group-hover:-translate-y-2">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color}
                              flex items-center justify-center mb-6
                              group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Number */}
                <div className="absolute top-8 right-8 text-7xl font-bold text-gray-100
                              group-hover:text-eco-50 transition-colors">
                  0{index + 1}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`${feature.key}.description`)}
                </p>

                {/* Hover Line */}
                <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-eco-400 to-emerald-300
                              rounded-full transform scale-x-0 group-hover:scale-x-100
                              transition-transform duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
