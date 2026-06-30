/* Handler push — chargé par le service worker Workbox (app fermée / écran verrouillé) */
const ACADEMY_TITLE = "VSM Academy";
const ACADEMY_ICON = "/icons/image_1782650717547.jpeg";

self.addEventListener("push", (event) => {
  let data = { title: ACADEMY_TITLE, body: "", url: "/notifications" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* ignore */
  }

  const title = data.title?.startsWith("VSM Academy") ? data.title : `${ACADEMY_TITLE} · ${data.title || "Notification"}`;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body,
      icon: ACADEMY_ICON,
      badge: ACADEMY_ICON,
      data: { url: data.url },
      tag: "vsm-academy",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/notifications";
  const absolute = new URL(url, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(absolute);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(absolute);
    }),
  );
});
