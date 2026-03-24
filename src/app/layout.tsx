import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://staynamcheon.com"),
  title: {
    default: "Stay Namcheon | 프리미엄 펜션 스테이 남천",
    template: "%s | Stay Namcheon"
  },
  description: "도심 속 온전한 휴식, 프리미엄 독채 펜션 스테이 남천입니다. 자연과 함께하는 고요한 시간을 경험하세요.",
  keywords: ["스테이남천", "경산펜션", "남천펜션", "독채펜션", "프리미엄펜션", "감성숙소", "캠프닉", "경산글램핑", "경산카페"],
  authors: [{ name: "Stay Namcheon" }],
  creator: "Stay Namcheon",
  publisher: "Stay Namcheon",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Stay Namcheon | 프리미엄 펜션 스테이 남천",
    description: "도심 속 온전한 휴식, 프리미엄 독채 펜션 스테이 남천입니다.",
    url: "https://staynamcheon.com",
    siteName: "Stay Namcheon",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stay Namcheon | 프리미엄 펜션 스테이 남천",
    description: "도심 속 온전한 휴식, 프리미엄 독채 펜션 스테이 남천입니다.",
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
        <AppLayoutControls>
          {children}
        </AppLayoutControls>
      </body>
    </html>
  );
}
