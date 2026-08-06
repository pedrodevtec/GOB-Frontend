import type { MetadataRoute } from "next";

import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/characters",
        "/dashboard",
        "/gameplay",
        "/profile",
        "/pvp",
        "/rewards",
        "/shop",
        "/tables",
        "/trades",
        "/transactions"
      ]
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: getSiteUrl()
  };
}
