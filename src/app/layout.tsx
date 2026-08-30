import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Your PCOS coach",
  description: "Track what actually works for you. A coach, not a course.",
  appleWebApp: { capable: true, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#c96a5e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
