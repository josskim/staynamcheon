import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const stories = await prisma.stayStory.findMany();
  if (stories.length > 1) {
    // 삭제 (제일 처음 등록된 1개 빼고 모두 삭제)
    const toDelete = stories.slice(1);
    for (const story of toDelete) {
      await prisma.stayStory.delete({ where: { id: story.id } });
    }
    console.log("Deleted duplicates.");
  } else {
    console.log("Only 1 story found or none.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
