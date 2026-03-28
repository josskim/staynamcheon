export const revalidate = 60;
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "예약 안내",
  description: "스테이 남천 예약 안내 및 이용 규정을 확인하세요. 경산 독채 펜션, 캠프닉 예약 문의는 전화 또는 카카오톡으로 연락주세요.",
  alternates: { canonical: "https://staynamcheon.com/reservation" },
  openGraph: {
    title: "예약 안내 | 스테이 남천",
    description: "스테이 남천 예약 안내. 경산 독채 펜션·캠프닉 예약 문의.",
    images: [{ url: "/images/lovable/hero.jpg", width: 1200, height: 630, alt: "스테이 남천 예약 안내" }],
  },
};

import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import { Phone, Clock, AlertCircle } from "lucide-react";
import prisma from "@/lib/db";

export default async function ReservationPage() {
  const content = await prisma.stayPageContent.findMany({
    where: { page: "reservation" }
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
    title: getVal("hero", "title", "Reservation"),
    subtitle: getVal("hero", "subtitle", "StayNamcheon Reservation & Policy"),
    backgroundImage: getVal("hero", "imageUrl", "/images/lovable/hero.jpg")
  };

  const phone = getVal("contact", "phone", "010-9038-5822");
  const checkin = getVal("info", "checkin", "오후 3:00");
  const checkout = getVal("info", "checkout", "오전 11:00");

  const refundPolicy = getJson("policy", "refund", [
    { period: "이용일 기준 10일전 취소", refund: "전액환불" },
    { period: "이용일 기준 7~9일전 취소", refund: "10% 공제후 환불" },
    { period: "이용일 기준 6일전 취소", refund: "20% 공제후 환불" },
    { period: "이용일 기준 5일전 취소", refund: "30% 공제후 환불" },
    { period: "이용일 기준 4일전 취소", refund: "40% 공제후 환불" },
    { period: "이용일 기준 3일전 취소", refund: "50% 공제후 환불" },
    { period: "이용일 기준 2일전 취소", refund: "70% 공제후 환불" },
    { period: "이용일 기준 1일전 또는 당일 취소", refund: "환불불가" },
  ]);

  return (
    <main className="min-h-screen bg-background pb-0">
      <Hero 
        title={hero.title}
        subtitle={hero.subtitle}
        backgroundImage={hero.backgroundImage}
      />

      <section className="section-spacing">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <div className="mb-20 text-center">
              <span className="text-xs font-medium tracking-[0.4em] uppercase text-accent mb-4 block">Contact Us</span>
              <h2 className="text-4xl font-semibold tracking-tight md:text-6xl mb-8">
                예약 안내<span className="text-secondary">.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                예약문의 주시면 친절히 상담해드리겠습니다.<br />
                자연과 함께하는 완벽한 휴식을 StayNamcheon에서 시작하세요.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
            <ScrollReveal direction="right">
              <div className="h-full p-8 md:p-12 rounded-3xl bg-secondary/5 border border-secondary/10 flex flex-col items-center text-center group hover:bg-secondary/10 transition-all duration-500">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Phone className="text-secondary" size={32} />
                </div>
                <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-secondary">StayNamcheon 예약문의</h3>
                <a 
                  href={`tel:${phone}`}
                  className="text-3xl md:text-4xl font-semibold tracking-tight hover:text-secondary transition-colors"
                >
                  {phone}
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2}>
              <div className="flex flex-col gap-6 h-full">
                <div className="flex-1 p-6 md:p-8 rounded-3xl bg-foreground/5 border border-foreground/10 flex flex-col items-center justify-center text-center group hover:bg-foreground/10 transition-all duration-500">
                  <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Clock className="text-foreground" size={24} />
                  </div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-2 opacity-60 text-foreground">체크인 기준 시간</h3>
                  <p className="text-2xl md:text-3xl font-semibold tracking-tight">
                    {checkin}
                  </p>
                </div>

                <div className="flex-1 p-6 md:p-8 rounded-3xl bg-secondary/5 border border-secondary/10 flex flex-col items-center justify-center text-center group hover:bg-secondary/10 transition-all duration-500">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Clock className="text-secondary" size={24} />
                  </div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-2 text-secondary">체크아웃 기준 시간</h3>
                  <p className="text-2xl md:text-3xl font-semibold tracking-tight">
                    {checkout}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="mb-12 flex items-center gap-4">
              <AlertCircle className="text-secondary" />
              <h2 className="text-3xl font-semibold tracking-tight">환불 규정</h2>
            </div>
            
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="grid grid-cols-2 bg-muted/50 p-6 border-b border-border">
                <span className="text-sm font-bold tracking-widest uppercase">취소 시점</span>
                <span className="text-sm font-bold tracking-widest uppercase text-right">환불 규정</span>
              </div>
              <div className="divide-y divide-border">
                {refundPolicy.map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-2 p-6 hover:bg-muted/30 transition-colors">
                    <span className="text-sm md:text-base font-medium">{item.period}</span>
                    <span className={`text-sm md:text-base font-semibold text-right ${idx === refundPolicy.length - 1 ? 'text-destructive' : 'text-foreground'}`}>
                      {item.refund}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 p-8 rounded-2xl bg-muted/30 border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                * 올바른 예약문화 정착을 위해 환불규정을 반드시 확인하신 후 예약해주시기 바랍니다.<br />
                * 예약 취소 및 변경은 전화 문의를 통해 가능합니다.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
