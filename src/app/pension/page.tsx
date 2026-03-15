"use client";

import Hero from "@/components/Hero";
import RoomCard from "@/components/RoomCard";
import RoomGallery from "@/components/RoomGallery";
import ScrollReveal from "@/components/ScrollReveal";

const rooms = [
  {
    name: "2F Room 201",
    description: "2 Rooms — Spacious suite with mountain views and modern amenities. A tranquil retreat designed for families and small groups seeking stillness.",
    image: "/images/lovable/pension.jpg",
    prices: [
      { price: "300,000 KRW", label: "Off-season Weekdays (Mon–Thu)" },
      { price: "350,000 KRW", label: "Off-season Weekend (Fri–Sun)" },
      { price: "400,000 KRW", label: "Peak Season (Jul 15 – Aug 30)" },
    ],
  },
  {
    name: "2F Room 202",
    description: "2 Rooms — Elegant retreat with natural light and premium bedding. Minimalist aesthetics meet natural textures for the ultimate relaxation.",
    image: "/images/lovable/hero.jpg",
    prices: [
      { price: "300,000 KRW", label: "Off-season Weekdays (Mon–Thu)" },
      { price: "350,000 KRW", label: "Off-season Weekend (Fri–Sun)" },
      { price: "400,000 KRW", label: "Peak Season (Jul 15 – Aug 30)" },
    ],
  },
  {
    name: "1F Room 101",
    description: "1 Room — Intimate ground-floor room with direct garden access. Perfect for couples or solo travelers looking to stay close to nature.",
    image: "/images/room.png",
    prices: [
      { price: "180,000 KRW", label: "Off-season Weekdays (Mon–Thu)" },
      { price: "220,000 KRW", label: "Off-season Weekend (Fri–Sun)" },
      { price: "280,000 KRW", label: "Peak Season (Jul 15 – Aug 30)" },
    ],
  },
];

const galleryImages = [
  { src: "/images/lovable/gallery1.jpg", alt: "Living space" },
  { src: "/images/lovable/gallery2.jpg", alt: "Bedroom detail" },
  { src: "/images/lovable/gallery3.jpg", alt: "Outdoor view" },
  { src: "/images/lovable/pension.jpg", alt: "StayNamcheon exterior" },
  { src: "/images/lovable/cafe.jpg", alt: "In-house cafe" },
  { src: "/images/lovable/campnic.jpg", alt: "Camping experience" },
];

export default function PensionPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Hero 
        title="Living in Nature" 
        subtitle="StayNamcheon Pension Showcase" 
        backgroundImage="/images/hero.png"
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
            {rooms.map((room, i) => (
              <RoomCard key={room.name} {...room} index={i} />
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
