import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("visitor_id")?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "방문자 인증 필요" }, { status: 401 });
  }

  try {
    const visitor = await prisma.chatVisitor.findUnique({ where: { token } });
    if (!visitor) {
      return NextResponse.json({ ok: false, error: "방문자 없음" }, { status: 404 });
    }

    const { subscription } = (await req.json()) as {
      subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
    };

    if (!subscription?.endpoint) {
      return NextResponse.json({ ok: false, error: "구독 정보 필요" }, { status: 400 });
    }

    await prisma.visitorPushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        visitorId: visitor.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Visitor push subscribe error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
