import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/seo/site-url";

const publicStaticRoutes = [
  "/",
  "/termos",
  "/terms",
  "/privacidade",
  "/privacy",
  "/contato"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicStaticRoutes.map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.5
  }));
}
