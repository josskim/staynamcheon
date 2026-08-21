import type { Metadata } from "next";
import { Clock3, Coffee, MapPin, Phone, UsersRound } from "lucide-react";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import { NAVER_PLACE_URL, SITE_URL, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "제2야수교 면회객 당일 이용",
  description:
    "제2야수교 면회객을 위한 스테이남천 당일 이용 안내. 오전 10시부터 오후 6시까지 가족과 편안하게 이용할 수 있습니다.",
  alternates: { canonical: `${SITE_URL}/military-visit` },
  openGraph: {
    title: "제2야수교 면회객 당일 이용 | 스테이남천",
    description: "제2야수교 면회 당일 10시~18시 이용. 인원과 날짜를 전화로 상담해 주세요.",
    url: `${SITE_URL}/military-visit`,
    images: [{ url: "/images/lovable/cafe.jpg", width: 1200, height: 630, alt: "제2야수교 면회객 당일 이용 스테이남천" }],
  },
};

const faqs = [
  ["이용 시간은 언제인가요?", "면회객 당일 이용 시간은 오전 10시부터 오후 6시까지입니다."],
  ["숙박하지 않고 당일만 이용할 수 있나요?", "가능합니다. 면회 일정과 인원에 맞춰 당일 이용으로 상담해 드립니다."],
  ["예약할 때 무엇을 알려야 하나요?", "이용 날짜, 총인원, 예상 도착 시간과 필요한 공간을 전화로 알려주세요."],
  ["숙박도 함께 예약할 수 있나요?", "가능합니다. 면회 전후 숙박이 필요하면 101호, 201호, 202호 또는 전체 대관으로 안내해 드립니다."],
] as const;

export default function MilitaryVisitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE_URL}/military-visit#service`,
        name: "제2야수교 면회객 당일 이용",
        description: "제2야수교 면회객이 오전 10시부터 오후 6시까지 이용할 수 있는 스테이남천 당일 대관 서비스",
        provider: { "@id": `${SITE_URL}/#lodging` },
        areaServed: "경상북도 경산시",
        url: `${SITE_URL}/military-visit`,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero
        title="제2야수교 면회"
        subtitle="면회객 당일 이용 · 오전 10시부터 오후 6시까지"
        backgroundImage="/images/lovable/cafe.jpg"
      />

      <section className="section-spacing">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-4 block text-xs font-semibold tracking-[0.35em] text-accent">MILITARY VISIT DAY USE</span>
              <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">면회하는 하루가 편안하도록</h2>
              <p className="mt-7 text-base leading-8 text-muted-foreground md:text-lg">
                스테이남천은 제2야수교 면회객이 가족과 함께 식사하고 쉬어갈 수 있도록 당일 이용을 운영합니다.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Clock3, "이용 시간", "10:00~18:00"],
              [UsersRound, "이용 방식", "가족·단체 당일 대관"],
              [Coffee, "공간", "식사와 휴식이 가능한 공간"],
              [MapPin, "위치", "경산시 남천면 남천로 31"],
            ].map(([Icon, label, value]) => {
              const ItemIcon = Icon as typeof Clock3;
              return (
                <div key={String(label)} className="rounded-3xl border border-border bg-white p-7">
                  <ItemIcon className="text-accent" size={24} />
                  <p className="mt-6 text-xs tracking-wider text-muted-foreground">{String(label)}</p>
                  <p className="mt-2 text-lg font-semibold">{String(value)}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <ScrollReveal direction="right">
              <div className="rounded-[2rem] bg-foreground p-8 text-white md:p-12">
                <p className="text-xs tracking-[0.3em] text-white/50">RESERVATION</p>
                <h2 className="mt-4 text-3xl font-semibold md:text-5xl">면회 일정이 정해지면 전화로 문의해 주세요.</h2>
                <p className="mt-6 leading-7 text-white/70">날짜, 총인원, 도착 예정 시간을 알려주시면 이용 가능한 공간과 금액을 안내해 드립니다.</p>
                <a href={`tel:${siteConfig.telephone}`} className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-foreground">
                  <Phone size={17} /> {siteConfig.telephone}
                </a>
                <a href={NAVER_PLACE_URL} target="_blank" rel="noopener noreferrer" className="ml-3 mt-3 inline-flex rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white">
                  네이버 지도
                </a>
              </div>
            </ScrollReveal>

            <section>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">자주 묻는 질문</h2>
              <div className="mt-7 divide-y divide-border border-y border-border">
                {faqs.map(([question, answer]) => (
                  <div key={question} className="py-6">
                    <h3 className="text-lg font-semibold">{question}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
