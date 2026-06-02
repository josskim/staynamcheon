import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { sendPushToAdmin, sendPushToVisitor } from "@/lib/push";

// GET: 메시지 목록 (폴링)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const after = searchParams.get("after"); // 마지막 메시지 ID 이후만

    if (!roomId) {
      return NextResponse.json({ ok: false, error: "roomId 필수" }, { status: 400 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 100,
      select: {
        id: true,
        senderType: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, messages });
  } catch (err) {
    console.error("Chat messages GET error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST: 메시지 전송
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, content, senderType } = body as {
      roomId: string;
      content: string;
      senderType?: string;
    };

    if (!roomId || !content?.trim()) {
      return NextResponse.json({ ok: false, error: "roomId, content 필수" }, { status: 400 });
    }

    // senderType 결정: admin 세션이 있으면 admin, 아니면 visitor
    let sender = senderType || "visitor";

    if (sender === "admin") {
      // admin 세션 확인
      const cookieStore = await cookies();
      const session = cookieStore.get("admin_session");
      if (!session) {
        return NextResponse.json({ ok: false, error: "관리자 인증 필요" }, { status: 401 });
      }
    } else {
      // visitor 쿠키 확인
      const cookieStore = await cookies();
      const token = cookieStore.get("visitor_id")?.value;
      if (!token) {
        return NextResponse.json({ ok: false, error: "방문자 인증 필요" }, { status: 401 });
      }
      sender = "visitor";
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderType: sender,
        content: content.trim(),
      },
      select: {
        id: true,
        senderType: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    });

    // 채팅방 updatedAt 갱신
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    // 방문자가 보낸 메시지면 관리자에게 푸시
    if (sender === "visitor") {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: { visitor: { select: { nickname: true } } },
      });
      await sendPushToAdmin(
        "새 채팅 문의",
        `${room?.visitor.nickname}: ${content.trim().slice(0, 50)}`,
        `/admin/dashboard/chat?room=${roomId}`
      );
    }

    // 관리자가 보낸 메시지면 방문자에게 푸시
    if (sender === "admin") {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { visitorId: true },
      });
      if (room) {
        await sendPushToVisitor(
          room.visitorId,
          "스테이 남천",
          content.trim().slice(0, 100)
        );
      }
    }

    return NextResponse.json({ ok: true, message });
  } catch (err) {
    console.error("Chat messages POST error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
