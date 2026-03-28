export const revalidate = 60;
import prisma from "@/lib/db";
import HeroSection from "@/components/HeroSection";
import ScrollSection from "@/components/ScrollSection";
import GallerySection from "@/components/GallerySection";
import ReservationSection from "@/components/ReservationSection";
import Footer from "@/components/Footer";

export default async function Home() {
  const contents = await prisma.stayPageContent.findMany({
    where: { page: "home" }
  });

  const getSectionContent = (section: string) => {
    const sectionData: any = {};
    contents.filter(c => c.section === section).forEach(c => {
      sectionData[c.key] = c.value;
    });
    return sectionData;
  };

  const heroContent = getSectionContent("hero");
  const pensionContent = getSectionContent("pension");
  const campnicContent = getSectionContent("campnic");
  const cafeContent = getSectionContent("cafe");
  const otherContent = getSectionContent("other");

  return (
    <div className="bg-background">
      <HeroSection content={heroContent} />

      <ScrollSection
        id="pension"
        label={pensionContent.label || "Accommodation"}
        title={pensionContent.title || "Pension"}
        description={pensionContent.description || "Thoughtfully designed rooms that frame the surrounding landscape. Floor-to-ceiling windows, warm wood interiors, and the quiet comfort of a home away from home."}
        image={pensionContent.imageUrl || "/images/lovable/pension.jpg"}
        imageAlt="Modern pension room with forest view"
        exploreHref="/pension"
      />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <ScrollSection
        id="campnic"
        label={campnicContent.label || "Outdoor Living"}
        title={campnicContent.title || "Campnic"}
        description={campnicContent.description || "Where camping meets picnic. Our curated glamping experience pairs the thrill of sleeping under the stars with the comforts you deserve — cozy tents, warm lights, and mountain air."}
        image={campnicContent.imageUrl || "/images/lovable/campnic.jpg"}
        imageAlt="Luxury glamping tent at golden hour"
        reverse
        exploreHref="/campnic"
      />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <ScrollSection
        id="cafe"
        label={cafeContent.label || "Taste & Aroma"}
        title={cafeContent.title || "Cafe"}
        description={cafeContent.description || "A minimalist cafe nestled within the property. Hand-dripped coffee, seasonal teas, and light bites — all served alongside panoramic views of the surrounding forest."}
        image={cafeContent.imageUrl || "/images/lovable/cafe.jpg"}
        imageAlt="Minimalist cafe with pour-over coffee"
        exploreHref="/cafe"
      />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <ScrollSection
        id="other"
        label={otherContent.label || "Experiences"}
        title={otherContent.title || "Other"}
        description={otherContent.description || "Discover hidden corners of Namcheon. From tranquil hammock terraces with mountain views to evening firepits under the stars — every moment here is designed for stillness."}
        image={otherContent.imageUrl || "/images/lovable/other.jpg"}
        imageAlt="Outdoor terrace with hammock and mountain view"
        reverse
        exploreHref="/other"
      />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <GallerySection />

      <div className="section-padding">
        <div className="border-t border-border" />
      </div>

      <ReservationSection />
      <Footer />
    </div>
  );
}
