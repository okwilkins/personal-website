import type { Metadata, Viewport } from "next";
import { CharacterGrid } from "@/components/character-grid";
import { ViewportGlass } from "@/components/viewport-glass";
import { SiteFooter } from "@/components/site-chrome";
import { NavigationMotion } from "@/components/navigation-motion";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    url: site.url,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.role}`,
      },
    ],
  },
  twitter: { card: "summary_large_image", creator: "@okwilkins" },
};

export const viewport: Viewport = { themeColor: "#0b0b0b" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className="dark" data-scroll-behavior="smooth">
      <body className="pt-[var(--page-gap)] pb-[calc(2rem_+_env(safe-area-inset-bottom))] sm:pb-[var(--page-gap)]">
        <NavigationMotion />
        <CharacterGrid />
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 inline-flex min-h-11 -translate-y-24 items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground focus:translate-y-0"
        >
          Skip to content
        </a>
        <div data-site-content className="relative z-10">
          <ViewportGlass />
          <div className="site-card shell">
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
