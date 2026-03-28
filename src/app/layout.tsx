import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://staynamcheon.com"),
  title: {
    default: "스테이 남천 | 경산 프리미엄 독채 펜션",
    template: "%s | 스테이 남천"
  },
  description: "도심 속 온전한 휴식, 경산 프리미엄 독채 펜션 스테이 남천입니다. 자연과 함께하는 고요한 시간, 캠프닉·카페·부대시설까지 한 곳에서 즐기세요.",
  keywords: ["스테이남천", "경산펜션", "남천펜션", "독채펜션", "프리미엄펜션", "감성숙소", "캠프닉", "경산글램핑", "경산카페", "경산숙소", "경산독채"],
  authors: [{ name: "Stay Namcheon" }],
  creator: "Stay Namcheon",
  publisher: "Stay Namcheon",
  alternates: {
    canonical: "https://staynamcheon.com",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "스테이 남천 | 경산 프리미엄 독채 펜션",
    description: "도심 속 온전한 휴식, 경산 프리미엄 독채 펜션 스테이 남천입니다. 캠프닉·카페·부대시설까지.",
    url: "https://staynamcheon.com",
    siteName: "스테이 남천",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/images/lovable/hero.jpg",
        width: 1200,
        height: 630,
        alt: "스테이 남천 경산 프리미엄 독채 펜션",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "스테이 남천 | 경산 프리미엄 독채 펜션",
    description: "도심 속 온전한 휴식, 경산 프리미엄 독채 펜션 스테이 남천입니다.",
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
};

import AppLayoutControls from "@/components/AppLayoutControls";
import Analytics from "@/components/Analytics";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "스테이 남천",
  description: "경산 프리미엄 독채 펜션. 캠프닉, 카페, 다양한 부대시설을 갖춘 감성 숙소.",
  url: "https://staynamcheon.com",
  image: "https://staynamcheon.com/images/lovable/hero.jpg",
  address: {
    "@type": "PostalAddress",
    addressRegion: "경상북도",
    addressLocality: "경산시",
    addressCountry: "KR",
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "독채 펜션", value: true },
    { "@type": "LocationFeatureSpecification", name: "캠프닉", value: true },
    { "@type": "LocationFeatureSpecification", name: "카페", value: true },
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
        <Analytics />
        <AppLayoutControls>
          {children}
        </AppLayoutControls>
      </body>
    </html>
  );
}
