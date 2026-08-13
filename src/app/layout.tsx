import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aura | Cinematic Salon Music Experience',
  description:
    'Continuous premium ambient music playback atmosphere with audio-reactive visuals.',
  keywords: ['music experience', 'ambient audio', 'salon atmosphere', 'cinematic music player'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-purple-500/30 selection:text-purple-200 min-h-screen relative overflow-x-hidden">
        <ErrorBoundary>
          <div className="relative min-h-screen flex flex-col">{children}</div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
