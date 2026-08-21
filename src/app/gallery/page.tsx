import { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "갤러리",
  description: "스테이남천의 공간을 사진과 영상으로 확인하세요. 대형 단체 펜션, 독채 객실, 캠프닉과 부대시설을 소개합니다.",
  alternates: { canonical: "https://www.xn--q20b145avpd59fmvg.com/gallery" },
  openGraph: {
    title: "갤러리 | 스테이남천",
    description: "스테이남천의 대형 단체 펜션, 독채 객실과 캠프닉 공간을 사진과 영상으로 확인하세요.",
    images: [{ url: "/images/lovable/gallery1.jpg", width: 1200, height: 630, alt: "스테이남천 갤러리" }],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
