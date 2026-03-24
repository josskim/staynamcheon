export const revalidate = 60;
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pension",
  description: "스테이 남천의 프리미엄 독채 객실을 소개합니다. 자연과 조화를 이루는 감성적인 공간에서 진정한 휴식을 즐겨보세요.",
};

import Hero from "@/components/Hero";
import RoomCard from "@/components/RoomCard";
import RoomGallery from "@/components/RoomGallery";
import ScrollReveal from "@/components/ScrollReveal";
import prisma from "@/lib/db";

export default async function PensionPage() {
  const content = await prisma.stayPageContent.findMany({
    where: { page: "pension" }
  });

  const getVal = (section: string, key: string, fallback: string = "") => {
    return content.find(c => c.section === section && c.key === key)?.value || fallback;
  };

  const getJson = (section: string, key: string, fallback: any = []) => {
    const val = content.find(c => c.section === section && c.key === key)?.value;
    try {
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const hero = {
    title: getVal("hero", "title", "Living in Nature"),
    subtitle: getVal("hero", "subtitle", "StayNamcheon Pension Showcase"),
    backgroundImage: getVal("hero", "imageUrl", "/images/hero.png")
  };

  const rooms = getJson("rooms", "list", [
    {
      name: "2F Room 201",
      description: "2 Rooms — Spacious suite with mountain views and modern amenities.",
      image: "/images/lovable/pension.jpg",
      prices: [
        { price: "300,000 KRW", label: "Off-season Weekdays (Mon–Thu)" },
        { price: "400,000 KRW", label: "Peak Season (Jul 15 – Aug 30)" }
      ]
    }
  ]);

  const galleryImages = getJson("gallery", "images", [
    { src: "/images/lovable/gallery1.jpg", alt: "Living space" },
    { src: "/images/lovable/gallery2.jpg", alt: "Bedroom detail" },
    { src: "/images/lovable/gallery3.jpg", alt: "Outdoor view" },
    { src: "/images/lovable/pension.jpg", alt: "StayNamcheon exterior" },
    { src: "/images/lovable/cafe.jpg", alt: "In-house cafe" },
    { src: "/images/lovable/campnic.jpg", alt: "Camping experience" }
  ]);

  return (
    <main className="min-h-screen bg-background pb-20">
      <Hero 
        title={hero.title}
        subtitle={hero.subtitle}
        backgroundImage={hero.backgroundImage}
      />

      <section className="section-spacing">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-24 text-center">
              <h2 className="text-4xl font-semibold tracking-tight md:text-7xl">
                Rooms & Experience
              </h2>
              <p className="mt-6 text-sm text-muted-foreground tracking-[0.3em] uppercase max-w-xl mx-auto leading-relaxed">
                We provide thoughtfully curated spaces that blend seamlessly with the surrounding landscape.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 gap-24">
            {rooms.map((room: any, i: number) => (
              <RoomCard 
                key={i} 
                name={room.name}
                description={room.description}
                image={room.image}
                gallery={room.gallery}
                prices={room.prices}
                index={i} 
              />

            ))}
          </div>
        </div>
      </section>

      <RoomGallery images={galleryImages} />

      <ScrollReveal className="mt-32 px-6">
        <div className="mx-auto max-w-4xl text-center border-t border-border pt-20">
          <h3 className="text-3xl font-semibold italic">Ready to experience stillness?</h3>
          <a
            href="/"
            className="mt-10 inline-block border border-foreground px-12 py-4 text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-foreground hover:text-white"
          >
            Return to Home
          </a>
        </div>
      </ScrollReveal>
      
      <footer className="mt-32 text-center text-muted-foreground">
        <p className="text-[10px] tracking-[0.5em] uppercase">© StayNamcheon 2026</p>
      </footer>
    </main>
  );
}
