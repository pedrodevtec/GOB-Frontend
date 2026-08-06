import { appConfig } from "@/lib/api/config";

export function getSiteUrl() {
  return appConfig.siteUrl.replace(/\/+$/, "");
}

export function getAbsoluteUrl(pathname = "/") {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${getSiteUrl()}${normalizedPathname}`;
}
