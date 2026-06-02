const DEFAULT_CHAT_URL = "/admin/dashboard/chat";
const DEFAULT_TITLE = "\uc2a4\ud14c\uc774\ub0a8\ucc9c";
const DEFAULT_BODY = "\uc0c8 \uc54c\ub9bc\uc774 \uc788\uc2b5\ub2c8\ub2e4.";
const OPEN_ACTION_TITLE = "\ud655\uc778";

let badgeCount = 0;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const data = readPushData(event);
  const title = data.title || DEFAULT_TITLE;
  const body = data.body || DEFAULT_BODY;
  const url = data.url || DEFAULT_CHAT_URL;

  badgeCount += 1;

  event.waitUntil(
    self.registration
      .showNotification(title, {
        body,
        icon: "/admin/icons/icon-192.png",
        badge: "/admin/icons/icon-192.png",
        vibrate: [200, 100, 200],
        tag: data.tag || "staynamcheon-admin-chat",
        renotify: true,
        requireInteraction: true,
        timestamp: Date.now(),
        data: { url },
        actions: [{ action: "open", title: OPEN_ACTION_TITLE }],
      })
      .then(() => setBadge(badgeCount))
      .then(() => notifyOpenAdminWindows())
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  badgeCount = 0;
  clearBadge();

  const url = event.notification.data?.url || DEFAULT_CHAT_URL;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_BADGE") {
    badgeCount = 0;
    clearBadge();
  }
});

function readPushData(event) {
  if (!event.data) return {};

  try {
    return event.data.json();
  } catch {
    return { body: event.data.text() };
  }
}

function notifyOpenAdminWindows() {
  return self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if (client.url.includes("/admin")) {
        client.postMessage({ type: "NEW_CHAT_MESSAGE" });
      }
    }
  });
}

function setBadge(count) {
  if (self.navigator && self.navigator.setAppBadge) {
    return self.navigator.setAppBadge(count).catch(() => {});
  }
  return Promise.resolve();
}

function clearBadge() {
  if (self.navigator && self.navigator.clearAppBadge) {
    self.navigator.clearAppBadge();
  }
}
