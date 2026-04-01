import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const all = searchParams.get('all') === 'true';

    const stories = await prisma.stayStory.findMany({
      where: {
        ...(all ? {} : { isVisible: true }),
        ...(tag ? {
          tags: {
            contains: tag
          }
        } : {})
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

import { generateStoryHtml } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, images, tags, isVisible, useAI } = body;

    let finalContent = content;
    let finalTitle = title;

    if (useAI) {
      // AI 모드이면 content(프롬프트)와 images 배열을 전달하여 제목과 HTML을 모두 받아옴
      const aiResult = await generateStoryHtml(content, images || []);
      finalTitle = aiResult.title;
      finalContent = aiResult.content;
    }

    const story = await prisma.stayStory.create({
      data: {
        title: finalTitle,
        content: finalContent,
        images: images ? JSON.stringify(images) : "[]",
        tags: tags ? JSON.stringify(tags) : "[]",
        isVisible: isVisible ?? true,
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
