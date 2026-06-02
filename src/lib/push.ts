import webPush from "web-push";
import prisma from "@/lib/db";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const ADMIN_PUSH_ALLOWED_ORIGINS = new Set(
  (process.env.ADMIN_PUSH_ALLOWED_ORIGINS || "https://staynamcheon.com,https://www.staynamcheon.com")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)
);

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails("mailto:admin@staynamcheon.com", VAPID_PUBLIC, VAPID_PRIVATE);
}

async function sendPush(
  subs: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: string,
  deleteStale: (id: string) => Promise<void>
) {
  return Promise.allSettled(
    subs.map((sub) =>
      webPush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 60, urgency: "high" }
        )
        .catch(async (err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await deleteStale(sub.id).catch(() => {});
            return;
          }
          console.error("Push notification failed:", {
            endpoint: sub.endpoint.slice(0, 80),
            statusCode: err.statusCode,
            body: err.body,
            message: err.message,
          });
        })
    )
  );
}

function isAllowedAdminOrigin(origin: string | null) {
  if (!origin) return false;

  const normalized = origin.trim().replace(/\/$/, "");
  if (normalized === "stay") return false;

  try {
    const url = new URL(normalized);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return false;
  } catch {
    return false;
  }

  return ADMIN_PUSH_ALLOWED_ORIGINS.has(normalized);
}

export async function sendPushToAdmin(title: string, body: string, url?: string) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;
  const subs = (await prisma.adminPushSubscription.findMany()).filter((sub) =>
    isAllowedAdminOrigin(sub.adminId)
  );
  if (subs.length === 0) return;
  const payload = JSON.stringify({ title, body, url: url || "/admin/dashboard/chat" });
  return sendPush(subs, payload, (id) => prisma.adminPushSubscription.delete({ where: { id } }));
}

export async function sendPushToVisitor(visitorId: string, title: string, body: string) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;
  const subs = await prisma.visitorPushSubscription.findMany({ where: { visitorId } });
  if (subs.length === 0) return;
  const payload = JSON.stringify({ title, body, url: "/" });
  return sendPush(subs, payload, (id) => prisma.visitorPushSubscription.delete({ where: { id } }));
}
