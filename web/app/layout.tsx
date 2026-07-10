import "./globals.css";
import type { Metadata, Viewport } from "next";
import { TabBar } from "@/components/mobile/TabBar";

export const metadata: Metadata = {
  title: "footy-mp",
  description: "Football tracker + xG prediction engine",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#131110",
};

/**
 * Root layout: constrains to a phone width, always mounts the bottom TabBar,
 * pads the bottom of scrollable content so the TabBar never covers the last row.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{
          maxWidth: 480, margin: "0 auto", minHeight: "100vh",
          background: "var(--bg-app)", position: "relative",
        }}>
          <div style={{ paddingBottom: 92 }}>{children}</div>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
