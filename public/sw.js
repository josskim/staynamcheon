// Homepage Service Worker — visitor push notifications + badge

let badgeCount = 0;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || "스테이 남천";
  const options = {
    body: data.body || "새 메시지가 있습니다.",
    icon: "/icon.png",
    badge: "/icon.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
  };

  badgeCount++;

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // 앱 아이콘 뱃지 (숫자)
      if (self.navigator && self.navigator.setAppBadge) {
        self.navigator.setAppBadge(badgeCount);
      }
      // 열려있는 탭에 알림음 트리거
      return self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          if (!client.url.includes("/admin")) {
            client.postMessage({ type: "NEW_CHAT_MESSAGE" });
          }
        }
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  badgeCount = 0;

  if (self.navigator && self.navigator.clearAppBadge) {
    self.navigator.clearAppBadge();
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (!client.url.includes("/admin") && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow("/");
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_BADGE") {
    badgeCount = 0;
    if (self.navigator && self.navigator.clearAppBadge) {
      self.navigator.clearAppBadge();
    }
  }
});
