"use client";

import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import RoomGallery from "@/components/RoomGallery";
import { Clock, Users, Coffee, Thermometer, Tv, Info, CheckCircle2 } from "lucide-react";

const campnicGallery = [
  { src: "/images/lovable/campnic.jpg", alt: "Campnic area outdoors" },
  { src: "/images/lovable/gallery1.jpg", alt: "Cozy tent interior" },
  { src: "/images/lovable/gallery3.jpg", alt: "Sunset at campnic" },
  { src: "/images/lovable/pension.jpg", alt: "View from campnic" },
];

export default function CampnicPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Hero 
        title="Campnic Experience" 
        subtitle="Where Camping meets Picnic — Pure Stillness" 
        backgroundImage="/images/lovable/campnic.jpg"
      />

      {/* Intro Section */}
      <section className="section-spacing">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <div className="text-center">
              <span className="text-xs font-medium tracking-[0.4em] uppercase text-accent mb-4 block">Day Trip Glamping</span>
              <h2 className="text-4xl font-semibold tracking-tight md:text-6xl mb-8">
                Stillness in Nature
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                StayNamcheon의 캠프닉은 1부와 2부로 나누어 운영되는 당일 글램핑 서비스입니다. 
                복잡한 준비 없이 자연 속에서 여유로운 시간을 보내실 수 있도록 최상의 시설을 갖추고 있습니다.
                <br />
                <span className="mt-4 block font-medium text-foreground">🐶 애견 동반 가능</span>
              </p>
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
                <div className="flex justify-between items-end border-b border-border pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest leading-loose">Weekdays (Mon-Thu)</p>
                    <p className="text-3xl font-medium tracking-tight">50,000 KRW</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Base 2 / Max 10</p>
                </div>
                <div className="flex justify-between items-end border-b border-border pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest leading-loose">Weekend / Holidays</p>
                    <p className="text-3xl font-medium tracking-tight">70,000 KRW</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Fri-Sun / Peak Season</p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest leading-loose">Military Families</p>
                    <p className="text-3xl font-medium tracking-tight">80,000 KRW</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">No pax/time limit</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-4 bg-muted p-4 rounded-lg">
                  * 7월 15일~8월 30일(성수기)은 주말 요금이 적용됩니다. <br />
                  * 제2야수교/제2야전수송교육단 면회객분들은 전화 문의 부탁드립니다.
                </p>
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
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground text-white font-display text-xl">1</span>
                    <div>
                      <h4 className="font-semibold text-lg">Part 1 - Morning</h4>
                      <p className="text-muted-foreground">오전 11:00 ~ 오후 03:00</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground text-white font-display text-xl">2</span>
                    <div>
                      <h4 className="font-semibold text-lg">Part 2 - Evening</h4>
                      <p className="text-muted-foreground">오후 05:00 ~ 오후 09:00</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 p-4 border border-dashed border-border rounded-lg">
                  <p className="text-sm text-center text-muted-foreground">
                    체크인/아웃 시간 조정이 필요하시면 <br />
                    전화로 언제든지 문의해 주세요.
                  </p>
                </div>
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
            <ScrollReveal delay={0.1}>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-muted group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Thermometer size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-xl font-medium mb-3">All Seasons</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  겨울에는 따뜻한 전기판넬, 여름에는 시원한 에어컨이 구비되어 있어 언제나 편안합니다.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-muted group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Tv size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-xl font-medium mb-3">Entertainment</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  스마트폰 미러링 기능을 통해 캠핑 중에도 영화와 드라마를 자유롭게 감상하실 수 있습니다.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-muted group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <Coffee size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-xl font-medium mb-3">Included Essentials</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  숯, 그릴, 버너, 집게, 가위, 라면냄비, 장갑 등 취사에 필요한 핵심 도구가 기본 포함되어 있습니다.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Details & Rules */}
      <section className="section-spacing">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ScrollReveal direction="right">
              <div className="space-y-8">
                <h3 className="text-3xl font-semibold tracking-tight">Preparation Guide</h3>
                <div className="space-y-4">
                  {[
                    "고기 등 드실 음식물과 양념류",
                    "편리한 이용을 위한 일회용품",
                    "쓰레기 분리수거 및 식기 세척 필수",
                    "현장에서 음식물은 따로 판매하지 않습니다"
                  ].map((rule, i) => (
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
                <h3 className="text-3xl font-semibold tracking-tight">Extra Charges</h3>
                <div className="bg-muted p-8 rounded-2xl space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">인원 추가</span>
                    <span className="text-secondary">5,000 KRW / 인</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">시간 연장</span>
                    <span className="text-secondary">20,000 KRW / 시</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">12개월 이하 영유아</span>
                    <span className="text-secondary">무료</span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border flex items-start gap-2">
                    <Info size={16} className="text-muted-foreground mt-1 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      추가 요금은 현장에서 계좌이체 또는 현금 결제만 가능하며, 시간 연장은 사전 확인 후 가능합니다.
                    </p>
                  </div>
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
