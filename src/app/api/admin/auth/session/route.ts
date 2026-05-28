import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAdminSessionCookie, ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!session) {
    const url = new URL("/admin/login", request.url);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.json({ authenticated: true });
  setAdminSessionCookie(response, session.value);
  return response;
}
