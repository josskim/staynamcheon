import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const otherContent = [
    { page: 'other', section: 'hero', key: 'title', value: 'Experiences', type: 'text' },
    { page: 'other', section: 'hero', key: 'subtitle', value: 'Memorable Moments at StayNamcheon', type: 'text' },
    { page: 'other', section: 'hero', key: 'imageUrl', value: '/images/lovable/other.jpg', type: 'image' },
    
    // Pool
    { page: 'other', section: 'pool', key: 'title', value: 'Swimming Pool', type: 'text' },
    { page: 'other', section: 'pool', key: 'subtitle', value: '수영장', type: 'text' },
    { page: 'other', section: 'pool', key: 'description', value: '푸른 산을 배경으로 한 대형 트윈 수영장에서 온전한 휴식을 즐기세요. 깨끗한 수질 관리를 최우선으로 합니다.', type: 'text' },
    { page: 'other', section: 'pool', key: 'rules', value: JSON.stringify([
      "수영장은 6월~9월 말까지 운영됩니다.",
      "펜션 고객 전용으로 제공됩니다. (캠프닉 1부 고객 한정 이용 가능)",
      "매일 10시간 이상 정수 시스템을 가동합니다.",
      "캠프닉 고객님은 별도의 샤워실이 없으니 참고 부탁드립니다."
    ]), type: 'json' },
    { page: 'other', section: 'pool', key: 'images', value: JSON.stringify([
      { src: "/images/lovable/gallery1.jpg", alt: "Pool view 1" },
      { src: "/images/lovable/gallery2.jpg", alt: "Pool view 2" },
      { src: "/images/lovable/gallery3.jpg", alt: "Pool view 3" },
    ]), type: 'json' },

    // Air Bounce
    { page: 'other', section: 'bounce', key: 'title', value: 'Air Bounce', type: 'text' },
    { page: 'other', section: 'bounce', key: 'subtitle', value: '에어바운스', type: 'text' },
    { page: 'other', section: 'bounce', key: 'description', value: '아이들이 마음껏 뛰어놀 수 있는 안전하고 즐거운 에어바운스 시설이 마련되어 있습니다.', type: 'text' },
    { page: 'other', section: 'bounce', key: 'rules', value: JSON.stringify([
      "미취학 아동 및 초등학교 저학년 전용입니다.",
      "보호자의 동반 관찰 하에 이용해 주세요.",
      "신발을 벗고 이용해 주시기 바랍니다."
    ]), type: 'json' },
    { page: 'other', section: 'bounce', key: 'images', value: JSON.stringify([
      { src: "/videos/movie.mp4", alt: "Air bounce video" },
      { src: "/images/lovable/other.jpg", alt: "Air bounce facility" },
      { src: "/images/lovable/campnic.jpg", alt: "Outdoor playground" },
    ]), type: 'json' },

    // Table Tennis
    { page: 'other', section: 'pingpong', key: 'title', value: 'Table Tennis', type: 'text' },
    { page: 'other', section: 'pingpong', key: 'subtitle', value: '탁구장', type: 'text' },
    { page: 'other', section: 'pingpong', key: 'description', value: '액티브한 휴식을 원하신다면 활기찬 탁구 한 게임 어떠신가요? 온 가족이 함께 즐기기 좋습니다.', type: 'text' },
    { page: 'other', section: 'pingpong', key: 'rules', value: JSON.stringify([
      "이용 시간: 오전 10시 ~ 오후 9시",
      "사용한 라켓과 공은 제자리에 반납해 주세요.",
      "타인을 위해 과도한 소음은 자제 부탁드립니다."
    ]), type: 'json' },
    { page: 'other', section: 'pingpong', key: 'images', value: JSON.stringify([
      { src: "/images/lovable/gallery2.jpg", alt: "Table tennis room" },
      { src: "/images/lovable/gallery1.jpg", alt: "Activity area" },
    ]), type: 'json' },

    // Golf Range
    { page: 'other', section: 'golf', key: 'title', value: 'Golf Range', type: 'text' },
    { page: 'other', section: 'golf', key: 'subtitle', value: '골프연습장', type: 'text' },
    { page: 'other', section: 'golf', key: 'description', value: '자연 속에서 가볍게 스윙을 연습할 수 있는 미니 골프 연습 공간입니다.', type: 'text' },
    { page: 'other', section: 'golf', key: 'rules', value: JSON.stringify([
      "안전을 위해 한 번에 한 분씩만 타석에 입장해 주세요.",
      "개인 클럽을 지참하셔도 좋습니다.",
      "연습용 공은 사용 후 수거해 주세요."
    ]), type: 'json' },
    { page: 'other', section: 'golf', key: 'images', value: JSON.stringify([
      { src: "/images/lovable/other.jpg", alt: "Golf range setup" },
      { src: "/images/lovable/hero.jpg", alt: "Golf practice view" },
    ]), type: 'json' }
  ];

  try {
    for (const content of otherContent) {
      await prisma.stayPageContent.upsert({
        where: {
          page_section_key: {
            page: content.page,
            section: content.section,
            key: content.key
          }
        },
        update: content,
        create: content
      });
    }
    return NextResponse.json({ message: "Other page content seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ message: "Error seeding content" }, { status: 500 });
  }
}
