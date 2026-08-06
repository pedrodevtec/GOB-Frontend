import { GoogleAdsenseAd } from "@/components/layout/google-adsense-ad";

export default function PublicLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      {children}
      <GoogleAdsenseAd />
    </div>
  );
}
