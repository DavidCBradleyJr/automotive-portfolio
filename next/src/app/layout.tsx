import type { Metadata } from 'next';
import { Orbitron, Space_Grotesk } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'David Bradley | Automotive Photography',
  description: 'Automotive photography portfolio showcasing JDM, Euro, Supercar, and American Muscle vehicles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[#0e0e12] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
