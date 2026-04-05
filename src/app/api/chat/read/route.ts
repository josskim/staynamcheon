import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST: 메시지 읽음 처리
export async function POST(req: NextRequest) {
  try {
    const { roomId, senderType } = (await req.json()) as {
      roomId: string;
      senderType: string; // 읽는 쪽의 type: admin이 읽으면 visitor 메시지를 읽음 처리
    };

    if (!roomId || !senderType) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // admin이 읽으면 visitor가 보낸 메시지를 읽음 처리, 그 반대도 마찬가지
    const targetSender = senderType === "admin" ? "visitor" : "admin";

    await prisma.chatMessage.updateMany({
      where: { roomId, senderType: targetSender, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Chat read error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
