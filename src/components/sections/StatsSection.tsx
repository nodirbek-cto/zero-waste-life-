'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Recycle, Leaf, MapPin } from 'lucide-react';

const stats = [
  { icon: Users, value: '300+', label: 'Active Users', color: 'text-blue-500' },
  { icon: Recycle, value: '860+', label: 'Items Recycled', color: 'text-eco-500' },
  { icon: Leaf, value: '1000+ kg', label: 'CO₂ Saved', color: 'text-emerald-500' },
  { icon: MapPin, value: '30+', label: 'Locations', color: 'text-purple-500' },
];

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-eco-900 to-eco-800">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2, type: 'spring' }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2"
              >
                {stat.value}
              </motion.div>
              <div className="text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
