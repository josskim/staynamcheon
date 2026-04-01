
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const contents = await prisma.stayPageContent.findMany({
    where: { section: "cafe" }
  });
  console.log("Cafe Section Content:", JSON.stringify(contents, null, 2));
  
  const gallery = await prisma.stayGalleryItem.findMany({
    take: 5
  });
  console.log("Gallery Sample:", JSON.stringify(gallery, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
