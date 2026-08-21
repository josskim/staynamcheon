import { Metadata } from "next";
import prisma from "@/lib/db";
import StoryDetailClient from "./StoryDetailClient";
import { SITE_URL } from "@/lib/site-config";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const id = params?.id;
  
  const story = await prisma.stayStory.findUnique({
    where: { id }
  });

  if (!story) {
    return {
      title: "Story Not Found | Stay Namcheon",
    };
  }

  const images = JSON.parse(story.images || "[]");
  const imageUrl = images[0] || "/images/lovable/hero.jpg";
  const plainText = story.content.replace(/<[^>]+>/g, '').substring(0, 160);

  return {
    title: `${story.title} | Story | Stay Namcheon`,
    description: plainText,
    alternates: { canonical: `${SITE_URL}/story/${story.id}` },
    openGraph: {
      title: story.title,
      description: plainText,
      url: `${SITE_URL}/story/${story.id}`,
      images: [{ url: imageUrl }],
    },
  };
}

export default async function StoryDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params?.id;
  
  const story = await prisma.stayStory.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

  if (!story) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-background">
        <h1 className="text-2xl text-muted-foreground">스토리를 찾을 수 없습니다.</h1>
      </main>
    );
  }

  return (
    <StoryDetailClient 
      story={{
        ...story,
        createdAt: story.createdAt.toISOString()
      }} 
    />
  );
}
