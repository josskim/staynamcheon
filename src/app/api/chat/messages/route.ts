import { after as afterResponse, NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { sendPushToAdmin, sendPushToVisitor } from "@/lib/push";
import { clientMessageIdPattern, messageId } from "@/lib/chat-delivery";

const messageSelect = { id: true, roomId: true, senderType: true, content: true, isRead: true, createdAt: true } as const;

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
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
      select: {
        id: true,
        senderType: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, messages: messages.reverse() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Chat messages GET error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST: 메시지 전송
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, content, senderType, clientMessageId } = body as {
      roomId: string;
      content: string;
      senderType?: string;
      clientMessageId?: string;
    };

    if (typeof roomId !== "string" || !roomId || roomId.length > 200 || typeof content !== "string" || !content.trim() || content.length > 10000) {
      return NextResponse.json({ ok: false, error: "roomId, content 필수" }, { status: 400 });
    }
    if (clientMessageId !== undefined && (typeof clientMessageId !== "string" || !clientMessageIdPattern.test(clientMessageId))) {
      return NextResponse.json({ ok: false, error: "잘못된 전송 ID" }, { status: 400 });
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
      const owner = await prisma.chatRoom.findFirst({ where: { id: roomId, visitor: { token } }, select: { id: true } });
      if (!owner) return NextResponse.json({ ok: false, error: "채팅방 접근 권한이 없습니다." }, { status: 403 });
      sender = "visitor";
    }

    const id = clientMessageId ? messageId(roomId, sender, clientMessageId) : undefined;
    const existingResponse = async () => {
      if (!id) return null;
      const saved = await prisma.chatMessage.findUnique({ where: { id }, select: messageSelect });
      if (!saved) return null;
      if (saved.roomId !== roomId || saved.senderType !== sender || saved.content !== content.trim()) {
        return NextResponse.json({ ok: false, error: "같은 전송 ID의 내용이 다릅니다." }, { status: 409 });
      }
      return NextResponse.json({ ok: true, message: saved });
    };
    const existing = await existingResponse();
    if (existing) return existing;

    let message;
    try {
      message = await prisma.$transaction(async tx => {
        const saved = await tx.chatMessage.create({
          data: { ...(id ? { id } : {}), roomId, senderType: sender, content: content.trim() },
          select: messageSelect,
        });
        await tx.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });
        return saved;
      });
    } catch (error) {
      // Concurrent retries can race at the unique key. Return the durable winner.
      if (id && typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        const winner = await existingResponse();
        if (winner) return winner;
      }
      throw error;
    }

    // Push is an independent best-effort side effect, never a message-save failure.
    afterResponse(async () => {
      try {
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId }, include: { visitor: { select: { nickname: true } } } });
        if (!room) return;
        if (sender === "visitor") {
          await sendPushToAdmin("새 채팅 문의", `${room.visitor.nickname}: ${content.trim().slice(0, 50)}`, `/admin/dashboard/chat?room=${roomId}`);
        } else {
          await sendPushToVisitor(room.visitorId, "스테이 남천", content.trim().slice(0, 100));
        }
      } catch (error) {
        console.error("Chat push failed after durable save:", { messageId: message.id, error });
      }
    });
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    console.error("Chat messages POST error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
