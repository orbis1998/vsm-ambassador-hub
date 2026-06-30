/* Handler push — chargé par le service worker Workbox (app fermée / écran verrouillé) */
const ACADEMY_TITLE = "VSM Academy";
const ACADEMY_ICON = "/icons/image_1782650717547.jpeg";
const ACADEMY_ORIGIN = "https://academy.vsmcollection.com";

function resolveNotificationUrl(raw) {
  if (!raw) return `${ACADEMY_ORIGIN}/notifications`;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `${ACADEMY_ORIGIN}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

self.addEventListener("push", (event) => {
  let data = { title: ACADEMY_TITLE, body: "", url: "/notifications" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* ignore */
  }

  const title = data.title?.startsWith("VSM Academy") ? data.title : `${ACADEMY_TITLE} · ${data.title || "Notification"}`;
  const url = resolveNotificationUrl(data.url);

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body,
      icon: ACADEMY_ICON,
      badge: ACADEMY_ICON,
      data: { url },
      tag: "vsm-academy",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = resolveNotificationUrl(event.notification.data?.url);
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
