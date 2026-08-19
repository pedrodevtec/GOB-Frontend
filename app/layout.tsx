import type { Metadata } from "next";
import Script from "next/script";

import "@/app/globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { appConfig } from "@/lib/api/config";
import { getSiteUrl } from "@/lib/seo/site-url";

const googleTagManagerId = "GTM-KMNCWCDF";
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const googleAdsenseEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === "true";
const googleAdsenseAccount = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT;
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: `${appConfig.appName} | Crie seu personagem`,
  description:
    "Conheça Bravantus, crie seu personagem e participe de uma história guiada pelo Mestre.",
  icons: {
    icon: [
      {
        url: "/images/logos/favicon.svg",
        type: "image/svg+xml"
      }
    ],
    shortcut: "/images/logos/favicon.svg"
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification
      }
    : undefined,
  other:
    googleAdsenseEnabled && googleAdsenseAccount
      ? { "google-adsense-account": googleAdsenseAccount }
      : undefined
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${googleTagManagerId}');
          `}
        </Script>
        {googleAdsId ? (
          <>
            <Script
              id="google-ads"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads-config" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}');
              `}
            </Script>
          </>
        ) : null}
        {googleAdsenseEnabled && googleAdsenseAccount ? (
          <Script
            id="google-adsense"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsenseAccount}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
