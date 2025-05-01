import '@ui/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LingoTime',
  description: 'Language Learning App',
  openGraph: {
    title: 'LingoTime',
    description: 'Language Learning App',
    type: 'website',
    url: 'https://www.me-dangnhatminh.id.vn',
    images: [],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
