"use client";

import { useEffect } from "react";

const googleAdsenseAccount =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT ?? "ca-pub-1860520355492237";
const googleAdsenseSlot =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT ?? "8419006487";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function GoogleAdsenseAd() {
  useEffect(() => {
    if (!googleAdsenseAccount || !googleAdsenseSlot) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // AdSense can throw when an ad blocker or local environment blocks the script.
    }
  }, []);

  if (!googleAdsenseAccount || !googleAdsenseSlot) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={googleAdsenseAccount}
        data-ad-slot={googleAdsenseSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
