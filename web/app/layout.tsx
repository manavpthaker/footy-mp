import "./globals.css";
import type { Metadata, Viewport } from "next";
import { TabBar } from "@/components/mobile/TabBar";
import { TopNav } from "@/components/mobile/TopNav";

export const metadata: Metadata = {
  title: "footy-mp",
  description: "Football tracker + xG prediction engine",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#131110",
};

/**
 * Responsive root: `.fmp-shell` caps to 480 on phone / 1200 on desktop.
 * TopNav shows on desktop only, TabBar shows on mobile only (see globals.css).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="fmp-shell">
          <TopNav />
          <div className="fmp-shell-inner">{children}</div>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
