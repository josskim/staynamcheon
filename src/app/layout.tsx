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
  title: "Stay Namcheon | 프리미엄 펜션 스테이 남천",
  description: "도심 속 온전한 휴식, 프리미엄 독채 펜션 스테이 남천입니다.",
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
