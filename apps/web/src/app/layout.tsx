import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'ArbEdge - Professional Sports Arbitrage Intelligence',
  description:
    'Identify guaranteed-profit arbitrage opportunities across 50+ US sportsbooks with sub-3-second latency and AI-powered confidence scoring.',
  keywords: [
    'sports betting',
    'arbitrage',
    'sports arbitrage',
    'betting software',
    'odds comparison',
    'guaranteed profit',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
