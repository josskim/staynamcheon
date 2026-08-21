import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, Check, Clock3, MessageCircleMore, UsersRound } from "lucide-react";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import { SITE_URL, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "경산 대형 단체 펜션·워크숍",
  description:
    "경산 모임·워크숍 대형 단체 펜션 스테이남천. 공식 숙박 최대 24명이며, 30명 내외 단체는 별도 상담 가능합니다.",
  alternates: { canonical: `${SITE_URL}/group` },
  openGraph: {
    title: "경산 대형 단체 펜션·워크숍 | 스테이남천",
    description: "모임과 워크숍을 위한 전체 대관. 공식 숙박 최대 24명, 30명 내외 단체 별도 상담.",
    url: `${SITE_URL}/group`,
    images: [{ url: "/images/lovable/pension.jpg", width: 1200, height: 630, alt: "경산 대형 단체 펜션 스테이남천" }],
  },
};

const highlights = [
  { icon: UsersRound, label: "공식 숙박 인원", value: "최대 24명" },
  { icon: MessageCircleMore, label: "단체 별도 상담", value: "30명 내외" },
  { icon: BedDouble, label: "전체 대관", value: "101·201·202호" },
  { icon: Clock3, label: "이용 시간", value: "15시 입실 · 11시 퇴실" },
] as const;

const faqs = [
  ["30명도 숙박할 수 있나요?", "공식 숙박 최대 인원은 24명입니다. 유아가 포함되거나 추가 침구가 필요하지 않은 단체는 30명 내외까지 전화로 별도 상담해 주세요."],
  ["워크숍이나 가족 모임으로 이용할 수 있나요?", "가능합니다. 단체 구성과 필요한 객실, 공용 공간 이용 방식을 확인한 뒤 가장 적합한 대관 방법을 안내해 드립니다."],
  ["전체 대관은 어떤 객실을 사용하나요?", "101호, 201호, 202호를 함께 이용하는 방식입니다. 201호와 202호만 사용하는 결합 상품도 별도로 선택할 수 있습니다."],
  ["예약은 어떻게 하나요?", "인원과 이용 목적, 날짜를 정한 뒤 전화로 문의해 주세요. 24명을 초과하는 경우에는 인원 구성을 함께 알려주시면 빠르게 확인할 수 있습니다."],
] as const;

export default function GroupStayPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/group#webpage`,
        url: `${SITE_URL}/group`,
        name: "경산 대형 단체 펜션·워크숍 | 스테이남천",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#lodging` },
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
        title="대형 단체 펜션"
        subtitle="모임·워크숍 · 공식 숙박 최대 24명 · 30명 내외 별도 상담"
        backgroundImage="/images/lovable/pension.jpg"
      />

      <section className="section-spacing">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="mb-4 block text-xs font-semibold tracking-[0.35em] text-accent">GROUP STAY</span>
              <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">함께 머물기 좋은 넉넉한 공간</h2>
              <p className="mt-7 text-base leading-8 text-muted-foreground md:text-lg">
                스테이남천은 가족 모임, 친구 모임, 워크숍 등 대형 단체가 한 공간에서 편안하게
                머물 수 있는 경산 단체 펜션입니다.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-3xl border border-border bg-white p-6 text-center md:p-8">
                <Icon className="mx-auto text-accent" size={24} />
                <p className="mt-5 text-xs tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-2 text-lg font-semibold md:text-xl">{value}</p>
              </div>
            ))}
          </div>

          <ScrollReveal>
            <div className="mt-16 rounded-[2rem] bg-foreground p-8 text-primary-foreground md:p-14">
              <h2 className="text-3xl font-semibold md:text-5xl">인원 안내</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-6">
                  <p className="text-sm text-white/60">공식 숙박 인원</p>
                  <p className="mt-2 text-3xl font-semibold">최대 24명</p>
                </div>
                <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6">
                  <p className="text-sm text-white/60">상담 가능 인원</p>
                  <p className="mt-2 text-3xl font-semibold">30명 내외</p>
                </div>
              </div>
              <p className="mt-7 text-sm leading-7 text-white/70 md:text-base">
                {siteConfig.consultationCapacity} 가능합니다. 예약 전 실제 성인·아동·유아 인원과 침구 필요 수량을 알려주세요.
              </p>
            </div>
          </ScrollReveal>

          <section className="mt-24">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">자주 묻는 질문</h2>
            <div className="mt-10 divide-y divide-border border-y border-border">
              {faqs.map(([question, answer]) => (
                <div key={question} className="py-7 md:grid md:grid-cols-[1fr_2fr] md:gap-12">
                  <h3 className="text-lg font-semibold">{question}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:mt-0 md:text-base">{answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-20 flex flex-col items-center rounded-3xl bg-secondary/10 p-8 text-center md:p-12">
            <Check className="text-secondary" size={28} />
            <h2 className="mt-5 text-3xl font-semibold">단체 구성에 맞게 상담해 드립니다.</h2>
            <p className="mt-4 text-muted-foreground">날짜·인원·이용 목적을 알려주시면 객실 구성을 빠르게 안내해 드립니다.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={`tel:${siteConfig.telephone}`} className="rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-white">
                전화 상담 {siteConfig.telephone}
              </a>
              <Link href="/pension" className="rounded-full border border-foreground/20 px-8 py-4 text-sm font-semibold">
                객실 자세히 보기
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
