const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const homeContent = [
  { page: "home", section: "hero", key: "title", value: "Stay Namcheon", type: "text" },
  { page: "home", section: "hero", key: "subtitle", value: "A Retreat into Nature", type: "text" },
  { page: "home", section: "hero", key: "imageUrl", value: "/images/lovable/hero.jpg", type: "image" },
  
  { page: "home", section: "pension", key: "label", value: "Accommodation", type: "text" },
  { page: "home", section: "pension", key: "title", value: "Pension", type: "text" },
  { page: "home", section: "pension", key: "description", value: "Thoughtfully designed rooms that frame the surrounding landscape. Floor-to-ceiling windows, warm wood interiors, and the quiet comfort of a home away from home.", type: "text" },
  { page: "home", section: "pension", key: "imageUrl", value: "/images/lovable/pension.jpg", type: "image" },
  
  { page: "home", section: "campnic", key: "label", value: "Outdoor Living", type: "text" },
  { page: "home", section: "campnic", key: "title", value: "Campnic", type: "text" },
  { page: "home", section: "campnic", key: "description", value: "Where camping meets picnic. Our curated glamping experience pairs the thrill of sleeping under the stars with the comforts you deserve — cozy tents, warm lights, and mountain air.", type: "text" },
  { page: "home", section: "campnic", key: "imageUrl", value: "/images/lovable/campnic.jpg", type: "image" },
  
  { page: "home", section: "cafe", key: "label", value: "Taste & Aroma", type: "text" },
  { page: "home", section: "cafe", key: "title", value: "Cafe", type: "text" },
  { page: "home", section: "cafe", key: "description", value: "A minimalist cafe nestled within the property. Hand-dripped coffee, seasonal teas, and light bites — all served alongside panoramic views of the surrounding forest.", type: "text" },
  { page: "home", section: "cafe", key: "imageUrl", value: "/images/lovable/cafe.jpg", type: "image" },

  { page: "home", section: "other", key: "label", value: "Experiences", type: "text" },
  { page: "home", section: "other", key: "title", value: "Other", type: "text" },
  { page: "home", section: "other", key: "description", value: "Discover hidden corners of Namcheon. From tranquil hammock terraces with mountain views to evening firepits under the stars — every moment here is designed for stillness.", type: "text" },
  { page: "home", section: "other", key: "imageUrl", value: "/images/lovable/other.jpg", type: "image" },
];

async function seed() {
  console.log("Seeding home content...");
  for (const item of homeContent) {
    await prisma.stayPageContent.upsert({
      where: {
        page_section_key: {
          page: item.page,
          section: item.section,
          key: item.key
        }
      },
      update: {},
      create: item,
    });
  }
  console.log("Seed completed.");
}

seed()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
