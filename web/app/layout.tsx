import "./globals.css";
import type { Metadata, Viewport } from "next";
import React from "react";
import { AppHeader } from "@/components/mobile/AppHeader";
import { TabBar } from "@/components/mobile/TabBar";
import { MobileScreenPicker } from "@/components/mobile/MobileScreenPicker";

export const metadata: Metadata = {
  title: { default: "MPFC", template: "%s · MPFC" },
  description:
    "World football, 0→100: follow players, clubs, leagues and national teams "
    + "from World Cup 2026 to 2030 — with an xG match model and daily AI reads.",
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest",
  robots: { index: false },   // personal tool — stay out of search engines
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#131110",
};

/**
 * Parallel-route layout. Renders sticky AppHeader once, then splits into
 * two panes on desktop (rail + detail, each scrolls independently). On
 * mobile a single-column scroll region shows whichever slot the URL asks
 * for — MobileScreenPicker inspects pathname and hides the rail whenever
 * the URL is a detail route (`/matches/[id]`, `/teams/[id]`, etc).
 */
export default function RootLayout({
  rail, detail,
}: {
  children: React.ReactNode;      // unused — every route uses named slots
  rail: React.ReactNode;
  detail: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="fmp-shell">
          <AppHeader />

          {/* Desktop: two independent-scroll panes */}
          <div className="fmp-two-pane fmp-desktop-only">
            <div className="fmp-rail">{rail}</div>
            <div className="fmp-detail">{detail}</div>
          </div>

          {/* Mobile: one scroll region, MobileScreenPicker chooses rail or detail */}
          <div className="fmp-scroll fmp-mobile-only">
            <div className="fmp-cap">
              <MobileScreenPicker rail={rail} detail={detail} />
            </div>
          </div>

          <TabBar />
        </div>
      </body>
    </html>
  );
}
