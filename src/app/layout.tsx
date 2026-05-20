import type { Metadata } from 'next';
import { Inter, Calistoga } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const calistoga = Calistoga({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-cal',
  display: 'swap',
});

export async function generateStaticParams() {
  return [];
}

export const metadata: Metadata = {
  title: 'Zero Waste Life - Eco Gamification Platform',
  description: 'Join the movement to clean our planet. Earn rewards for recycling and eco-friendly actions.',
  keywords: ['eco', 'recycling', 'gamification', 'sustainability', 'environment'],
  authors: [{ name: 'Zero Waste Life Team' }],
  openGraph: {
    title: 'Zero Waste Life',
    description: 'Clean the Planet, Earn Rewards',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${calistoga.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
