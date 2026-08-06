export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Bravantus",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? ""
};
