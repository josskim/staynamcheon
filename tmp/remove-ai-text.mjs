import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const stories = await prisma.stayStory.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (stories.length > 0) {
      const targetStory = stories[0];
      
      const newContent = targetStory.content.replace('& AI Editor', '');
      
      await prisma.stayStory.update({
        where: { id: targetStory.id },
        data: {
          content: newContent
        }
      });
      console.log("Story updated successfully: " + targetStory.id);
    } else {
      console.log("No stories found to update.");
    }
  } catch (error) {
    console.error("Error updating story:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
