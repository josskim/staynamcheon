import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_TAGS_KEY = "default_tags";
const SECTION = "defaults";
const PAGE = "story_settings";

export async function GET() {
  try {
    const setting = await prisma.stayPageContent.findUnique({
      where: {
        page_section_key: {
          page: PAGE,
          section: SECTION,
          key: DEFAULT_TAGS_KEY,
        },
      },
    });

    if (!setting) {
      // 기본 생성될 경우
      return NextResponse.json({
        tags: [
          "#스테이남천", "#경산펜션", "#대구근교펜션", "#경산워크샵", "#제2야수교",
          "#제2야전수송교육", "#캠프닉", "#경산캠프닉", "#경산대형펜션", "#가족모임",
          "#계모임", "#단체모임펜션", "#경산풀빌라", "#경산바베큐", "#수영장펜션", "#시골늙은개발자"
        ]
      });
    }

    return NextResponse.json({ tags: JSON.parse(setting.value) });
  } catch (error) {
    console.error("Failed to fetch default tags:", error);
    return NextResponse.json({ error: "Failed to fetch default tags" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tags } = await req.json();

    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: "tags must be an array" }, { status: 400 });
    }

    const setting = await prisma.stayPageContent.upsert({
      where: {
        page_section_key: {
          page: PAGE,
          section: SECTION,
          key: DEFAULT_TAGS_KEY,
        },
      },
      update: {
        value: JSON.stringify(tags),
      },
      create: {
        page: PAGE,
        section: SECTION,
        key: DEFAULT_TAGS_KEY,
        value: JSON.stringify(tags),
        type: "json",
      },
    });

    return NextResponse.json({ tags: JSON.parse(setting.value) });
  } catch (error) {
    console.error("Failed to save default tags:", error);
    return NextResponse.json({ error: "Failed to save default tags" }, { status: 500 });
  }
}
