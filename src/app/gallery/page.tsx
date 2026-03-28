import { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "갤러리",
  description: "스테이 남천의 아름다운 공간을 사진과 영상으로 감상하세요. 펜션, 캠프닉, 카페, 부대시설의 모든 순간.",
  alternates: { canonical: "https://staynamcheon.com/gallery" },
  openGraph: {
    title: "갤러리 | 스테이 남천",
    description: "스테이 남천의 아름다운 공간을 사진과 영상으로 감상하세요.",
    images: [{ url: "/images/lovable/gallery1.jpg", width: 1200, height: 630, alt: "스테이 남천 갤러리" }],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
