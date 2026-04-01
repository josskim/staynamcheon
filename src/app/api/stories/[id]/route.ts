import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateStoryHtml } from "@/lib/openai";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const story = await prisma.stayStory.findUnique({
      where: { id },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to fetch story:", error);
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await req.json();
    const { title, content, images, tags, isVisible, useAI } = body;

    let finalContent = content;
    let finalTitle = title;

    if (useAI) {
      const aiResult = await generateStoryHtml(content, images || []);
      finalTitle = aiResult.title;
      finalContent = aiResult.content;
    }

    const story = await prisma.stayStory.update({
      where: { id: params.id },
      data: {
        title: finalTitle,
        content: finalContent,
        images: images ? JSON.stringify(images) : "[]",
        tags: tags ? JSON.stringify(tags) : "[]",
        isVisible: isVisible ?? true,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to update story:", error);
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.stayStory.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete story:", error);
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}
