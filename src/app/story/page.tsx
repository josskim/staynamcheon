import { Metadata } from "next";
import StoryClient from "./StoryClient";

export const metadata: Metadata = {
  title: "스토리",
  description: "스테이남천의 다양한 이야기와 소식을 만나보세요.",
  alternates: { canonical: "https://www.xn--q20b145avpd59fmvg.com/story" },
  openGraph: {
    title: "스토리 | 스테이남천",
    description: "스테이남천의 다양한 이야기와 소식을 만나보세요.",
    images: [{ url: "/images/lovable/hero.jpg", width: 1200, height: 630, alt: "스테이남천 스토리" }],
  },
};

export default function StoryPage() {
  return <StoryClient />;
}
