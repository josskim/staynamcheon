import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";

function parseBrowser(ua: string): string {
  if (ua.includes("SamsungBrowser")) return "Samsung";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  return "기타";
}

function parseOS(ua: string): string {
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Macintosh")) return "Mac";
  if (ua.includes("Linux")) return "Linux";
  return "기타";
}

function parseDevice(ua: string): string {
  if (ua.includes("iPad") || (ua.includes("Android") && !ua.includes("Mobile"))) {
    return "tablet";
  }
  if (ua.includes("Mobile") || ua.includes("iPhone") || ua.includes("Android")) {
    return "mobile";
  }
  return "desktop";
}

function parseReferrerDomain(referrer: string): string {
  if (!referrer) return "직접접속";
  try {
    const url = new URL(referrer);
    const hostname = url.hostname;
    if (!hostname) return "직접접속";
    if (hostname.includes("google")) return "Google";
    if (hostname.includes("naver")) return "Naver";
    if (hostname.includes("kakao")) return "Kakao";
    return hostname;
  } catch {
    return "직접접속";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, sessionId } = body as {
      path?: string;
      referrer?: string;
      sessionId?: string;
    };

    if (!path) return NextResponse.json({ ok: false });

    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const userAgent = req.headers.get("user-agent") ?? "";

    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);
    const device = parseDevice(userAgent);
    const referrerDomain = parseReferrerDomain(referrer ?? "");

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "";
    const ipHash = ip
      ? crypto.createHash("sha256").update(ip).digest("hex")
      : null;

    await prisma.pageView.create({
      data: {
        path,
        referrer: referrer || null,
        referrerDomain,
        userAgent: userAgent || null,
        browser,
        os,
        device,
        ipHash,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Analytics track error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
