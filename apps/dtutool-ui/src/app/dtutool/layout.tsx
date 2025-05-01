import type { Metadata, Viewport } from 'next';
import { PropsWithChildren } from 'react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'DTU Course Registration System',
    template: '%s | DTU Course Registration',
  },
  description:
    'Interactive course registration system with schedule conflict detection',
  keywords: [
    'course registration',
    'university',
    'schedule planner',
    'academic',
    'DTU',
    'conflict checker',
  ],
  authors: [
    {
      name: 'DTU Academic Affairs',
      url: 'https://dtu.edu.vn',
    },
  ],
  creator: 'DTU IT Department',
  publisher: 'DTU University',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://registration.dtu.edu.vn'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'vi-VN': '/vi-VN',
    },
  },
  openGraph: {
    title: 'DTU Course Registration System',
    description: 'Plan your academic schedule and check for course conflicts',
    url: 'https://registration.dtu.edu.vn',
    siteName: 'DTU Registration Portal',
    images: [
      {
        url: '/images/og-graduation.jpg',
        width: 1200,
        height: 630,
        alt: 'DTU Course Registration System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  facebook: {
    appId: '1204923461086329',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DTU Course Registration System',
    description: 'Plan your academic schedule and check for course conflicts',
    images: ['/images/twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#5bbad5',
      },
    ],
  },
  manifest: '/site.webmanifest',
  applicationName: 'DTU Course Registration',
  appleWebApp: {
    capable: true,
    title: 'DTU Registration',
    statusBarStyle: 'black-translucent',
  },
  category: 'education',
  classification: 'Academic, Education, Course Registration',
  other: {
    'msapplication-TileColor': '#2b5797',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#ffffff',
    'last-updated': '2025-04-29 00:51:54',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
