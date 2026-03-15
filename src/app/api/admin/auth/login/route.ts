import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { adminId, password } = await request.json();

    // 1. Initial Seeding Logic (run on first login attempt)
    const adminCount = await prisma.stayAdmin.count();
    if (adminCount === 0) {
      await prisma.stayAdmin.create({
        data: {
          adminId: "stay",
          password: "hare4828", // 요청하신 계정 정보
          name: "Administrator",
        },
      });
    }

    // 2. Authentication
    const admin = await prisma.stayAdmin.findUnique({
      where: { adminId },
    });

    if (!admin || admin.password !== password) {
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 3. Session Management (Simplistic for now, using a cookie)
    // In a real app, use iron-session or next-auth
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
