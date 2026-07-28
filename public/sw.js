const STATIC_CACHE = "scisiam-static-v4";
const STATIC_PATH_PREFIXES = ["/_next/static/", "/icons/"];
const STATIC_FILES = [
  "/ai-oon-logo.png",
  "/favicon.png",
  "/icon.png",
  "/scisiam-logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_FILES)),
  );
});

self.addEventListener("message", (event) => {
  if (event.origin !== self.location.origin || !event.source?.url) return;

  const sourceUrl = new URL(event.source.url);
  if (sourceUrl.origin !== self.location.origin) return;

  if (event.data?.type === "SCISIAM_SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("push", (event) => {
  const fallback = {
    title: "Scisiam",
    body: "คุณมีการแจ้งเตือนใหม่",
    url: "/classrooms",
    tag: "scisiam-notification",
  };
  let payload = fallback;

  try {
    payload = { ...fallback, ...event.data?.json() };
  } catch {
    payload.body = event.data?.text() || fallback.body;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/scisiam-full-192.png",
      badge: "/icons/scisiam-full-192.png",
      tag: payload.tag,
      renotify: true,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || "/classrooms",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existingClient = clients.find(
          (client) => new URL(client.url).origin === self.location.origin,
        );

        if (existingClient) {
          return existingClient.navigate(targetUrl).then(() => existingClient.focus());
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/")
  ) {
    return;
  }

  const isStaticAsset =
    STATIC_FILES.includes(url.pathname) ||
    STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  if (!isStaticAsset) return;

  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    }),
  );
});
