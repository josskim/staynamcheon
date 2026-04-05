import webPush from "web-push";
import prisma from "@/lib/db";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails("mailto:admin@staynamcheon.com", VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendPushToAdmin(title: string, body: string, url?: string) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const subs = await prisma.adminPushSubscription.findMany();
  const payload = JSON.stringify({ title, body, url: url || "/admin/dashboard/chat" });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webPush
        .sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
        .catch(async (err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.adminPushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
        })
    )
  );
  return results;
}
