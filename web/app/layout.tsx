import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "footy-mp",
  description: "Year-round football tracker + xG prediction engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
