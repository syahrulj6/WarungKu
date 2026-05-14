import React from "react";
import Head from "next/head";
import { env } from "~/env";

export const HeadMetaData: React.FC<{
  title?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  pathname?: string;
}> = ({
  title = "Kasirium",
  metaDescription = "Aplikasi POS modern untuk UMKM. Kelola produk, transaksi, dan laporan penjualan dengan cepat di Kasirium.",
  ogImageUrl = "/assets/landing-page.png",
  pathname = "",
}) => {
  const defaultTitle = "Kasirium";
  const fullTitle = title === defaultTitle ? defaultTitle : `${title} | ${defaultTitle}`;

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : env.NEXT_PUBLIC_BASE_URL;

  const pageUrl = new URL(pathname, baseUrl).toString();
  const socialImage = new URL(ogImageUrl, baseUrl).toString();

  return (
    <Head>
      <title>{fullTitle}</title>
      <link rel="icon" href="/warungku.png" />
      <link rel="canonical" href={pageUrl} />

      {/* metadata */}
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index,follow" />
      <meta name="theme-color" content="#10b981" />

      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content="Kasirium" />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:alt" content="Kasirium - Aplikasi POS modern untuk UMKM" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={socialImage} />
      <meta name="twitter:image:alt" content="Kasirium - Aplikasi POS modern untuk UMKM" />
    </Head>
  );
};


