// Homepage Service Worker — visitor push notifications + badge

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

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // 앱 아이콘 뱃지
      if (self.navigator && self.navigator.setAppBadge) {
        self.navigator.setAppBadge();
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

  // 뱃지 클리어
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
