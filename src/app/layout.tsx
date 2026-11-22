import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Snakes & Ladders — Play Casual Board Game',
  description: 'A cheerful, responsive casual Snakes & Ladders game for mobile and desktop.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6558E8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FFF8EF] text-[#25233A] selection:bg-[#6558E8]/20 selection:text-[#6558E8]">
        {children}
      </body>
    </html>
  );
}
