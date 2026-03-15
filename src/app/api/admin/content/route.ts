import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const section = searchParams.get("section");

  try {
    const where: any = {};
    if (page) where.page = page;
    if (section) where.section = section;

    const contents = await prisma.stayPageContent.findMany({
      where,
    });
    return NextResponse.json(contents);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { page, section, key, value, type } = await request.json();

    const content = await prisma.stayPageContent.upsert({
      where: {
        page_section_key: { page, section, key },
      },
      update: { value, type },
      create: { page, section, key, value, type },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Content update error:", error);
    return NextResponse.json({ message: "Error updating content" }, { status: 500 });
  }
}
