import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scisiam",
    short_name: "Scisiam",
    description:
      "ห้องแล็บวิทยาศาสตร์จำลองสำหรับนักเรียนและคุณครู ใช้งานได้ทั้งบนเว็บและหน้าจอโฮม",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    background_color: "#f3f7ff",
    theme_color: "#2563eb",
    orientation: "any",
    lang: "th",
    categories: ["education", "science"],
    icons: [
      {
        src: "/icons/scisiam-full-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/scisiam-full-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/scisiam-maskable-full-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
