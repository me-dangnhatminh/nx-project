import '@shadcn-ui/styles/globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@shadcn-ui/components/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Management App',
  description: 'A modern project management application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
