import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rooms = await prisma.chatRoom.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        visitor: { select: { nickname: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, senderType: true, createdAt: true },
        },
        _count: {
          select: {
            messages: { where: { senderType: "visitor", isRead: false } },
          },
        },
      },
    });

    const data = rooms.map((room) => ({
      id: room.id,
      nickname: room.visitor.nickname,
      isClosed: room.isClosed,
      lastMessage: room.messages[0]?.content || null,
      lastSender: room.messages[0]?.senderType || null,
      lastMessageAt: room.messages[0]?.createdAt || room.createdAt,
      unreadCount: room._count.messages,
      updatedAt: room.updatedAt,
    }));

    return NextResponse.json({ ok: true, rooms: data });
  } catch (err) {
    console.error("Admin chat rooms error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
