import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import RoomGallery from "@/components/RoomGallery";
import { Coffee, Snowflake, Flame, GlassWater } from "lucide-react";
import prisma from "@/lib/db";

export default async function CafePage() {
  const content = await prisma.stayPageContent.findMany({
    where: { page: "cafe" }
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
    title: getVal("hero", "title", "Cafe Namcheon"),
    subtitle: getVal("hero", "subtitle", "A Minimalist Space for Thoughtful Moments"),
    backgroundImage: getVal("hero", "imageUrl", "/images/lovable/cafe.jpg")
  };

  const menuItems = getJson("menu", "items", {
    hot: [
      { name: "아메리카노", price: "2,500원" },
      { name: "카페라떼", price: "3,000원" },
      { name: "카페모카", price: "3,000원" },
      { name: "고구마라뗴", price: "3,000원" },
      { name: "핫초코", price: "3,000원" },
      { name: "바닐라라뗴", price: "3,000원" },
    ],
    ice: [
      { name: "아이스 아메리카노", price: "2,500원" },
      { name: "아이스 카페라떼", price: "3,500원" },
      { name: "아이스 카페모카", price: "3,500원" },
      { name: "아이스 고구마라떼", price: "3,500원" },
      { name: "아이스 핫초코", price: "3,500원" },
      { name: "아이스 바닐라라뗴", price: "3,500원" },
    ],
    ade: [
      { name: "자몽에이드", price: "3,500원" },
      { name: "수박에이드", price: "3,500원" },
      { name: "레몬에이드", price: "3,500원" },
      { name: "오렌지에이드", price: "3,500원" },
      { name: "얼음컵", price: "1,500원" },
    ]
  });

  const cafeGallery = getJson("gallery", "images", [
    { src: "/videos/movie.mp4", alt: "Cafe vibe video" },
    { src: "/images/lovable/cafe.jpg", alt: "Cafe interior" },
    { src: "/images/lovable/gallery1.jpg", alt: "Coffee brewing" },
    { src: "/images/lovable/gallery2.jpg", alt: "Pastry detail" },
  ]);

  return (
    <main className="min-h-screen bg-background pb-20">
      <Hero 
        title={hero.title}
        subtitle={hero.subtitle}
        backgroundImage={hero.backgroundImage}
      />

      <section className="section-spacing">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <div className="mb-24 text-center">
              <h2 className="text-4xl font-semibold tracking-tight md:text-7xl">
                Our Menu
              </h2>
              <p className="mt-6 text-sm text-muted-foreground tracking-[0.3em] uppercase max-w-xl mx-auto leading-relaxed">
                Carefully crafted beverages to accompany your time in stillness.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* HOT Section */}
            <ScrollReveal delay={0.1}>
              <div className="space-y-10">
                <div className="flex items-center gap-3 border-b border-border pb-6">
                  <Flame size={20} className="text-orange-500" />
                  <h3 className="text-2xl font-semibold tracking-wide">HOT</h3>
                </div>
                <div className="space-y-6">
                  {menuItems.hot?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-baseline group">
                      <span className="text-lg font-medium tracking-tight group-hover:text-secondary transition-colors italic">{item.name}</span>
                      <div className="flex-grow border-b border-dotted border-border mx-4 h-px" />
                      <span className="text-sm font-body text-muted-foreground tracking-widest">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* ICE Section */}
            <ScrollReveal delay={0.2}>
              <div className="space-y-10">
                <div className="flex items-center gap-3 border-b border-border pb-6">
                  <Snowflake size={20} className="text-blue-400" />
                  <h3 className="text-2xl font-semibold tracking-wide">ICE</h3>
                </div>
                <div className="space-y-6">
                  {menuItems.ice?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-baseline group">
                      <span className="text-lg font-medium tracking-tight group-hover:text-secondary transition-colors italic">{item.name}</span>
                      <div className="flex-grow border-b border-dotted border-border mx-4 h-px" />
                      <span className="text-sm font-body text-muted-foreground tracking-widest">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* ADE Section */}
            <ScrollReveal delay={0.3}>
              <div className="space-y-10">
                <div className="flex items-center gap-3 border-b border-border pb-6">
                  <GlassWater size={20} className="text-accent" />
                  <h3 className="text-2xl font-semibold tracking-wide">ADE</h3>
                </div>
                <div className="space-y-6">
                  {menuItems.ade?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-baseline group">
                      <span className="text-lg font-medium tracking-tight group-hover:text-secondary transition-colors italic">{item.name}</span>
                      <div className="flex-grow border-b border-dotted border-border mx-4 h-px" />
                      <span className="text-sm font-body text-muted-foreground tracking-widest">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <RoomGallery images={cafeGallery} />

      <ScrollReveal className="mt-32 px-6">
        <div className="mx-auto max-w-4xl text-center border-t border-border pt-20">
          <h3 className="text-3xl font-semibold italic">Take a breath, have a coffee.</h3>
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
