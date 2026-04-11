import type { Metadata } from "next";

import "@/app/globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { appConfig } from "@/lib/api/config";

export const metadata: Metadata = {
  title: `${appConfig.appName} | RPG Dashboard`,
  description: "Frontend do web game RPG em Next.js."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
