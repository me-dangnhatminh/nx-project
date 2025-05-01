import { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./page-client";
import { headers } from "next/headers";

const defaultMetadata: Metadata = {
  title: "DTU Course Registration System",
  description: `Interactive course registration system with schedule conflict detection`,
  openGraph: { type: "website", locale: "en_US" },
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const xURL = headersList.get("x-url");
  if (!xURL) {
    console.error("x-url header not found");
    return defaultMetadata;
  }

  const rawURL = new URL(xURL);
  const origin = rawURL.origin;
  // const pathname = rawURL.pathname;
  const query = new URLSearchParams(rawURL.search);

  const ogImgURL = `${origin}/dtutool/opengraph-image?${query.toString()}`;
  console.log("ogImgURL", ogImgURL);

  return {
    title: "DTU Course Registration System",
    description:
      "Interactive course registration system with schedule conflict detection",
    openGraph: {
      url: rawURL.toString(),
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImgURL,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: "Mô tả hình ảnh",
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
