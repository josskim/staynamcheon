export const revalidate = 60;
import prisma from "@/lib/db";
import HeroSection from "@/components/HeroSection";
import ScrollSection from "@/components/ScrollSection";
import GallerySection from "@/components/GallerySection";
import ReservationSection from "@/components/ReservationSection";
import Footer from "@/components/Footer";
import StayOptions from "@/components/StayOptions";

type SectionContent = Record<string, string>;

export default async function Home() {
  const contents = await prisma.stayPageContent.findMany({
    where: { page: "home" }
  });

  const getSectionContent = (section: string) => {
    const sectionData: SectionContent = {};
    contents.filter(c => c.section === section).forEach(c => {
      sectionData[c.key] = c.value;
    });
    return sectionData;
  };

  const heroContent = getSectionContent("hero");
  const pensionContent = getSectionContent("pension");
  const campnicContent = getSectionContent("campnic");
  const cafeContent = getSectionContent("cafe");
  const otherContent = getSectionContent("other");

  return (
    <div className="bg-background">
      <HeroSection content={heroContent} />

      <StayOptions />

      <ScrollSection
        id="pension"
        label={pensionContent.label || "GROUP & WORKSHOP"}
        title={pensionContent.title || "대형 단체"}
        description={pensionContent.description || "모임과 워크숍을 위한 경산 대형 단체 펜션입니다. 공식 숙박 최대 24명이며, 유아 포함 또는 추가 침구가 필요하지 않은 30명 내외 단체는 별도 상담해 드립니다."}
        image={pensionContent.imageUrl || "/images/lovable/pension.jpg"}
        imageAlt="경산 대형 단체 펜션 스테이남천"
        exploreHref="/group"
      />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <ScrollSection
        id="other"
        label={otherContent.label || "PRIVATE STAY"}
        title={otherContent.title || "독채 펜션"}
        description={otherContent.description || "101호 독채와 201호·202호, 201+202호 전체 대관까지 인원과 여행 방식에 맞는 객실을 선택할 수 있습니다."}
        image={otherContent.imageUrl || "/images/lovable/other.jpg"}
        imageAlt="경산 독채 펜션 스테이남천"
        reverse
        exploreHref="/pension"
      />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <ScrollSection
        id="cafe"
        label={cafeContent.label || "MILITARY VISIT"}
        title={cafeContent.title || "제2야수교 면회"}
        description={cafeContent.description || "제2야수교 면회객이 가족과 편안하게 머물 수 있도록 오전 10시부터 오후 6시까지 당일 이용을 운영합니다."}
        image={cafeContent.imageUrl || "/images/lovable/cafe.jpg"}
        imageAlt="제2야수교 면회객 당일 이용 스테이남천"
        exploreHref="/military-visit"
      />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <ScrollSection
        id="campnic"
        label={campnicContent.label || "CAMPING & PICNIC"}
        title={campnicContent.title || "캠프닉"}
        description={campnicContent.description || "숙박 없이 즐기는 캠핑과 피크닉입니다. 1부는 오전 11시부터 오후 3시, 2부는 오후 5시부터 9시까지 운영합니다."}
        image={campnicContent.imageUrl || "/images/lovable/campnic.jpg"}
        imageAlt="경산 당일 캠프닉 스테이남천"
        reverse
        exploreHref="/campnic"
      />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <GallerySection />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <ReservationSection />
      <Footer />
    </div>
  );
}
