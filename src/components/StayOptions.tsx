import Link from "next/link";
import { ArrowUpRight, BedDouble, BriefcaseBusiness, Bus, TentTree } from "lucide-react";

const options = [
  {
    title: "대형 단체 펜션",
    description: "모임·워크숍을 위한 전체 대관. 공식 숙박 최대 24명, 30명 내외 단체는 별도 상담해 드립니다.",
    href: "/group",
    icon: BriefcaseBusiness,
    eyebrow: "GROUP & WORKSHOP",
  },
  {
    title: "독채·객실",
    description: "101호 독채부터 201호·202호, 201+202호 전체 대관까지 인원에 맞게 선택하세요.",
    href: "/pension",
    icon: BedDouble,
    eyebrow: "PRIVATE STAY",
  },
  {
    title: "제2야수교 면회",
    description: "면회 당일 오전 10시부터 오후 6시까지 가족과 편안하게 머물 수 있습니다.",
    href: "/military-visit",
    icon: Bus,
    eyebrow: "DAY USE",
  },
  {
    title: "캠프닉",
    description: "숙박 없이 즐기는 캠핑과 피크닉. 1부 11~15시, 2부 17~21시로 운영합니다.",
    href: "/campnic",
    icon: TentTree,
    eyebrow: "CAMPING & PICNIC",
  },
] as const;

export default function StayOptions() {
  return (
    <section id="stay-options" className="section-spacing bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-12 max-w-3xl md:mb-16">
          <span className="mb-4 block text-xs font-semibold tracking-[0.35em] text-accent">STAY NAMCHEON</span>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            필요한 이용 방식부터<br className="hidden sm:block" /> 바로 선택하세요.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            스테이남천은 대형 단체 숙박을 중심으로 독채 객실, 제2야수교 면회객 당일 이용,
            캠프닉을 한 공간에서 운영합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {options.map(({ title, description, href, icon: Icon, eyebrow }, index) => (
            <Link
              key={href}
              href={href}
              className="group relative min-h-64 overflow-hidden rounded-3xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl md:p-9"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-primary-foreground">
                  <Icon size={22} />
                </div>
                <span className="font-display text-5xl text-foreground/10">0{index + 1}</span>
              </div>
              <div className="mt-10">
                <span className="text-[10px] font-semibold tracking-[0.28em] text-accent">{eyebrow}</span>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
              </div>
              <ArrowUpRight
                className="absolute bottom-7 right-7 text-muted-foreground transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent md:bottom-9 md:right-9"
                size={22}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

