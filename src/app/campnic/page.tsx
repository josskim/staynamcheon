export const revalidate = 60;

import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import RoomGallery from "@/components/RoomGallery";
import { Clock, Users, Coffee, Thermometer, Tv, Info, CheckCircle2 } from "lucide-react";
import prisma from "@/lib/db";

export default async function CampnicPage() {
  const content = await prisma.stayPageContent.findMany({
    where: { page: "campnic" }
  });

  const getVal = (section: string, key: string, fallback: string = "") => {
    return content.find(c => c.section === section && c.key === key)?.value || fallback;
  };

  const getJson = (section: string, key: string, fallback: any = []) => {
    const val = content.find(c => c.section === section && c.key === key)?.value;
    try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
  };

  const hero = {
    title: getVal("hero", "title", "Campnic Experience"),
    subtitle: getVal("hero", "subtitle", "Where Camping meets Picnic — Pure Stillness"),
    backgroundImage: getVal("hero", "imageUrl", "/images/lovable/campnic.jpg")
  };

  const intro = {
    label: getVal("intro", "label", "Day Trip Glamping"),
    heading: getVal("intro", "heading", "Stillness in Nature"),
    description: getVal("intro", "description", "StayNamcheon의 캠프닉은 1부와 2부로 나누어 운영되는 당일 글램핑 서비스입니다.\n복잡한 준비 없이 자연 속에서 여유로운 시간을 보내실 수 있도록 최상의 시설을 갖추고 있습니다."),
    petNote: getVal("intro", "petNote", "🐶 애견 동반 가능")
  };

  const prices = getJson("pricing", "list", [
    { label: "Weekdays (Mon-Thu)", price: "50,000 KRW", note: "Base 2 / Max 10" },
    { label: "Weekend / Holidays", price: "70,000 KRW", note: "Fri-Sun / Peak Season" },
    { label: "Military Families", price: "80,000 KRW", note: "No pax/time limit" },
  ]);
  const priceNote = getVal("pricing", "note", "* 7월 15일~8월 30일(성수기)은 주말 요금이 적용됩니다.\n* 제2야수교/제2야전수송교육단 면회객분들은 전화 문의 부탁드립니다.");

  const schedule = getJson("schedule", "list", [
    { name: "Part 1 - Morning", time: "오전 11:00 ~ 오후 03:00" },
    { name: "Part 2 - Evening", time: "오후 05:00 ~ 오후 09:00" },
  ]);
  const scheduleNote = getVal("schedule", "note", "체크인/아웃 시간 조정이 필요하시면\n전화로 언제든지 문의해 주세요.");

  const amenities = getJson("amenities", "list", [
    { title: "All Seasons", description: "겨울에는 따뜻한 전기판넬, 여름에는 시원한 에어컨이 구비되어 있어 언제나 편안합니다." },
    { title: "Entertainment", description: "스마트폰 미러링 기능을 통해 캠핑 중에도 영화와 드라마를 자유롭게 감상하실 수 있습니다." },
    { title: "Included Essentials", description: "숯, 그릴, 버너, 집게, 가위, 라면냄비, 장갑 등 취사에 필요한 핵심 도구가 기본 포함되어 있습니다." },
  ]);

  const prepRules = getJson("prep", "rules", [
    "고기 등 드실 음식물과 양념류",
    "편리한 이용을 위한 일회용품",
    "쓰레기 분리수거 및 식기 세척 필수",
    "현장에서 음식물은 따로 판매하지 않습니다"
  ]);

  const extraCharges = getJson("extra", "charges", [
    { label: "인원 추가", price: "5,000 KRW / 인" },
    { label: "시간 연장", price: "20,000 KRW / 시" },
    { label: "12개월 이하 영유아", price: "무료" },
  ]);
  const extraNote = getVal("extra", "note", "추가 요금은 현장에서 계좌이체 또는 현금 결제만 가능하며, 시간 연장은 사전 확인 후 가능합니다.");

  const campnicGallery = getJson("gallery", "images", [
    { src: "/images/lovable/campnic.jpg", alt: "Campnic area outdoors" },
    { src: "/images/lovable/gallery1.jpg", alt: "Cozy tent interior" },
    { src: "/images/lovable/gallery3.jpg", alt: "Sunset at campnic" },
    { src: "/images/lovable/pension.jpg", alt: "View from campnic" },
  ]);

  const amenityIcons = [Thermometer, Tv, Coffee];

  return (
    <main className="min-h-screen bg-background pb-20">
      <Hero
        title={hero.title}
        subtitle={hero.subtitle}
        backgroundImage={hero.backgroundImage}
      />

      {/* Intro Section */}
      <section className="section-spacing">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <div className="text-center">
              <span className="text-xs font-medium tracking-[0.4em] uppercase text-accent mb-4 block">{intro.label}</span>
              <h2 className="text-4xl font-semibold tracking-tight md:text-6xl mb-8">
                {intro.heading}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {intro.description}
              </p>
              {intro.petNote && (
                <span className="mt-4 block font-medium text-foreground">{intro.petNote}</span>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing & Schedule Cards */}
      <section className="py-10 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Prices */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="bg-card card-border rounded-2xl p-8 md:p-12 h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <Users size={24} />
                </div>
                <h3 className="text-2xl font-semibold italic">Pricing</h3>
              </div>
              <div className="space-y-6">
                {prices.map((p: any, idx: number) => (
                  <div key={idx} className={`flex justify-between items-end ${idx < prices.length - 1 ? 'border-b border-border pb-4' : ''}`}>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest leading-loose">{p.label}</p>
                      <p className="text-3xl font-medium tracking-tight">{p.price}</p>
                    </div>
                    {p.note && <p className="text-xs text-muted-foreground italic">{p.note}</p>}
                  </div>
                ))}
                {priceNote && (
                  <p className="text-xs text-muted-foreground leading-relaxed mt-4 bg-muted p-4 rounded-lg whitespace-pre-line">
                    {priceNote}
                  </p>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Schedule */}
          <ScrollReveal direction="left" delay={0.4}>
            <div className="bg-card card-border rounded-2xl p-8 md:p-12 h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <Clock size={24} />
                </div>
                <h3 className="text-2xl font-semibold italic">Schedule</h3>
              </div>
              <div className="space-y-8">
                {schedule.map((s: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground text-white font-display text-xl">{idx + 1}</span>
                      <div>
                        <h4 className="font-semibold text-lg">{s.name}</h4>
                        <p className="text-muted-foreground">{s.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {scheduleNote && (
                  <div className="mt-10 p-4 border border-dashed border-border rounded-lg">
                    <p className="text-sm text-center text-muted-foreground whitespace-pre-line">
                      {scheduleNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="section-spacing bg-white/50">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-20 text-center">
              <h2 className="text-3xl font-semibold italic md:text-5xl">Comfort & Care</h2>
              <p className="mt-4 text-muted-foreground">사계절 내내 쾌적한 캠프닉을 위한 설비</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {amenities.map((a: any, idx: number) => {
              const Icon = amenityIcons[idx] || Coffee;
              return (
                <ScrollReveal key={idx} delay={0.1 * (idx + 1)}>
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-muted group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-xl font-medium mb-3">{a.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Details & Rules */}
      <section className="section-spacing">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ScrollReveal direction="right">
              <div className="space-y-8">
                <h3 className="text-3xl font-semibold tracking-tight">Preparation Guide(준비물)</h3>
                <div className="space-y-4">
                  {prepRules.map((rule: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-secondary mt-1 shrink-0" />
                      <p className="text-muted-foreground">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2}>
              <div className="space-y-8">
                <h3 className="text-3xl font-semibold tracking-tight">Extra Charges(추가요금)</h3>
                <div className="bg-muted p-8 rounded-2xl space-y-4">
                  {extraCharges.map((c: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span className="font-medium">{c.label}</span>
                      <span className="text-secondary">{c.price}</span>
                    </div>
                  ))}
                  {extraNote && (
                    <div className="pt-4 mt-4 border-t border-border flex items-start gap-2">
                      <Info size={16} className="text-muted-foreground mt-1 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {extraNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <RoomGallery images={campnicGallery} />

      {/* Footer CTA */}
      <ScrollReveal className="mt-20 px-6">
        <div className="mx-auto max-w-4xl text-center border-t border-border pt-20">
          <h3 className="text-3xl font-semibold italic">Ready for a mini escape?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="/"
              className="w-full sm:w-auto border border-foreground px-12 py-4 text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-foreground hover:text-white"
            >
              Return Home
            </a>
            <a
              href="tel:010-0000-0000"
              className="w-full sm:w-auto bg-secondary px-12 py-4 text-sm font-medium tracking-widest uppercase text-white transition-all duration-300 hover:bg-secondary/80"
            >
              Contact Us
            </a>
          </div>
        </div>
      </ScrollReveal>

      <footer className="mt-32 text-center text-muted-foreground">
        <p className="text-[10px] tracking-[0.5em] uppercase">© StayNamcheon 2026</p>
      </footer>
    </main>
  );
}
