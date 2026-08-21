import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { NAVER_PLACE_URL, SITE_URL, siteConfig } from "@/lib/site-config";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "스테이남천 | 경산 대형 단체 펜션·독채·제2야수교 면회",
    template: "%s | 스테이남천"
  },
  description: siteConfig.description,
  keywords: ["스테이남천", "경산 대형 펜션", "경산 단체 펜션", "경산 워크숍", "경산 모임", "경산 독채 펜션", "제2야수교 면회", "경산 캠프닉", "남천 펜션"],
  authors: [{ name: "Stay Namcheon" }],
  creator: "Stay Namcheon",
  publisher: "Stay Namcheon",
  alternates: {
    canonical: SITE_URL,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "스테이남천 | 경산 대형 단체 펜션·독채·제2야수교 면회",
    description: siteConfig.description,
    url: SITE_URL,
    siteName: siteConfig.name,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/images/lovable/hero.jpg",
        width: 1200,
        height: 630,
        alt: "스테이남천 경산 대형 단체 펜션",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "스테이남천 | 경산 대형 단체 펜션",
    description: siteConfig.description,
    images: ["/images/lovable/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#DB5461",
  },
};

import { GoogleAnalytics } from "@next/third-parties/google";
import AppLayoutControls from "@/components/AppLayoutControls";
import Analytics from "@/components/Analytics";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: siteConfig.name,
      alternateName: siteConfig.alternateNames,
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE_URL}/#lodging` },
    },
    {
      "@type": "LodgingBusiness",
      "@id": `${SITE_URL}/#lodging`,
      name: siteConfig.name,
      alternateName: siteConfig.alternateNames,
      description: siteConfig.description,
      url: SITE_URL,
      image: [
        `${SITE_URL}/images/lovable/hero.jpg`,
        `${SITE_URL}/images/lovable/pension.jpg`,
        `${SITE_URL}/images/lovable/campnic.jpg`,
      ],
      telephone: siteConfig.internationalTelephone,
      email: siteConfig.email,
      address: {
        "@type": "PostalAddress",
        ...siteConfig.address,
      },
      geo: {
        "@type": "GeoCoordinates",
        ...siteConfig.geo,
      },
      hasMap: NAVER_PLACE_URL,
      sameAs: [NAVER_PLACE_URL],
      checkinTime: siteConfig.checkinTime,
      checkoutTime: siteConfig.checkoutTime,
      currenciesAccepted: "KRW",
      numberOfRooms: 3,
      containsPlace: [
        { "@type": "Accommodation", name: "101호 독채", occupancy: { "@type": "QuantitativeValue", maxValue: 6 } },
        { "@type": "Accommodation", name: "201호", occupancy: { "@type": "QuantitativeValue", maxValue: 10 } },
        { "@type": "Accommodation", name: "202호", occupancy: { "@type": "QuantitativeValue", maxValue: 8 } },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "스테이남천 이용 상품",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "대형 단체 전체 대관", url: `${SITE_URL}/group` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "제2야수교 면회객 당일 이용", url: `${SITE_URL}/military-visit` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "캠프닉", url: `${SITE_URL}/campnic` } },
        ],
      },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "대형 단체 숙박", value: true },
        { "@type": "LocationFeatureSpecification", name: "독채 펜션", value: true },
        { "@type": "LocationFeatureSpecification", name: "제2야수교 면회객 당일 이용", value: true },
        { "@type": "LocationFeatureSpecification", name: "캠프닉", value: true },
        { "@type": "LocationFeatureSpecification", name: "바비큐", value: true },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${playfair.variable} ${montserrat.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <Analytics />
        <AppLayoutControls>
          {children}
        </AppLayoutControls>
      </body>
    </html>
  );
}
