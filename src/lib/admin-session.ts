import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ADMIN_SESSION_MAX_AGE,
};

export function setAdminSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, value, baseCookieOptions);
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
}
