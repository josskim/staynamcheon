export const revalidate = 60;
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experience",
  description: "해먹 테라스부터 불멍 공간까지, 스테이 남천 구석구석 숨어있는 고요한 공간들을 탐험해보세요.",
};

import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import RoomGallery from "@/components/RoomGallery";
import prisma from "@/lib/db";
import FacilityGallery from "./FacilityGallery"; // I will create this
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export default async function OtherPage() {
  const content = await prisma.stayPageContent.findMany({
    where: { page: "other" }
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

  const facilityIds = ["pool", "bounce", "pingpong", "golf"];
  const facilities = facilityIds.map(id => ({
    id,
    title: getVal(id, "title", id.charAt(0).toUpperCase() + id.slice(1)),
    subtitle: getVal(id, "subtitle"),
    description: getVal(id, "description"),
    rules: getJson(id, "rules", []),
    images: getJson(id, "images", [])
  })).filter(f => f.subtitle || f.description); // Only show if seeded

  return (
    <main className="min-h-screen bg-background pb-20">
      <Hero 
        title={getVal("hero", "title", "Experiences")} 
        subtitle={getVal("hero", "subtitle", "Memorable Moments at StayNamcheon")} 
        backgroundImage={getVal("hero", "imageUrl", "/images/lovable/other.jpg")}
      />

      <section className="section-spacing">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-32 text-center">
              <span className="text-xs font-medium tracking-[0.4em] uppercase text-accent mb-4 block">Our Facilities</span>
              <h2 className="text-4xl font-semibold tracking-tight md:text-7xl">
                Stay Active & Relaxed
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-40">
            {facilities.map((fac, i) => (
              <section key={fac.id} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className={cn(
                  i % 2 === 0 ? "lg:order-1" : "lg:order-2",
                  "max-w-xl mx-auto lg:mx-0"
                )}>
                  <ScrollReveal direction={i % 2 === 0 ? "right" : "left"}>
                    <span className="text-sm font-display tracking-widest text-secondary mb-2 block uppercase">{fac.title}</span>
                    <h3 className="text-5xl font-semibold tracking-tight mb-8">
                      {fac.subtitle}<span className="text-secondary">.</span>
                    </h3>
                    <p className="text-lg text-muted-relaxed mb-10 text-muted-foreground leading-relaxed whitespace-pre-line">
                      {fac.description}
                    </p>
                    <div className="space-y-4">
                      {fac.rules.map((rule: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-4">
                          <CheckCircle2 size={18} className="text-secondary mt-1 shrink-0" />
                          <p className="text-sm text-muted-foreground/80 leading-relaxed font-body">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollReveal>
                </div>

                <div className={cn(
                  i % 2 === 0 ? "lg:order-2" : "lg:order-1",
                  "w-full h-full"
                )}>
                  <ScrollReveal direction={i % 2 === 0 ? "left" : "right"} delay={0.2}>
                    <FacilityGallery images={fac.images} />
                  </ScrollReveal>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-40">
        <ScrollReveal>
          <div className="px-6 text-center mb-16">
            <h3 className="text-3xl font-semibold tracking-tight">Full Gallery</h3>
          </div>
        </ScrollReveal>
        <RoomGallery 
          images={getJson("gallery", "images", [])} 
        />
      </div>

      <ScrollReveal className="mt-32 px-6">
        <div className="mx-auto max-w-4xl text-center border-t border-border pt-20">
          <h3 className="text-3xl font-semibold italic text-secondary">Ready to explore Namcheon?</h3>
          <a
            href="/"
            className="mt-10 inline-block border border-foreground px-12 py-4 text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-foreground hover:text-white"
          >
            Back to Home
          </a>
        </div>
      </ScrollReveal>

      <footer className="mt-32 text-center text-muted-foreground">
        <p className="text-[10px] tracking-[0.5em] uppercase">© StayNamcheon 2026</p>
      </footer>
    </main>
  );
}
