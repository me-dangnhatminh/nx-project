import { Metadata } from 'next';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import PageClient from './page-client';

const defaultMetadata: Metadata = {
  title: 'DTU Course Registration System',
  description: `Interactive course registration system with schedule conflict detection`,
  openGraph: { type: 'website', locale: 'en_US' },
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const xURL = headersList.get('x-url');
  if (!xURL) {
    console.error('x-url header not found');
    return defaultMetadata;
  }

  const raw = new URL(xURL);
  const ogImgURL = `${raw.origin}${raw.pathname}/opengraph-image${raw.search}`;

  return {
    title: 'DTU Course Registration System',
    description: `Interactive course registration system with schedule conflict detection`,
    openGraph: {
      url: raw.href,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: ogImgURL,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: 'Mô tả hình ảnh',
        },
      ],
    },
  };
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageClient />
    </Suspense>
  );
}
