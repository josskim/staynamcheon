import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "crypto";
import prisma from "@/lib/db";

function generateNickname() {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // KST
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const h = String(now.getUTCHours()).padStart(2, "0");
  const min = String(now.getUTCMinutes()).padStart(2, "0");
  return `방문자_${m}${d}_${h}${min}`;
}

function makeToken() {
  return crypto.randomUUID();
}

export async function POST(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get("visitor_id")?.value;

    let visitor;
    if (token) {
      visitor = await prisma.chatVisitor.findUnique({
        where: { token },
        include: { room: { select: { id: true } } },
      });
    }

    if (!visitor) {
      token = makeToken();
      visitor = await prisma.chatVisitor.create({
        data: { token, nickname: generateNickname() },
        include: { room: { select: { id: true } } },
      });
    }

    // 채팅방이 없으면 생성
    let roomId = visitor.room?.id;
    if (!roomId) {
      const room = await prisma.chatRoom.create({
        data: { visitorId: visitor.id },
      });
      roomId = room.id;
    }

    const response = NextResponse.json({
      ok: true,
      roomId,
      nickname: visitor.nickname,
    });

    // 쿠키 설정 (1년)
    response.cookies.set("visitor_id", token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Chat init error:", err);
    return NextResponse.json({ ok: false, error: "초기화 실패" }, { status: 500 });
  }
}
