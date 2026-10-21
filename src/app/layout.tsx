import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "@/components/noir-chrome";
import { SiteFooter } from "@/components/noir-footer";
import "./globals.css";
import "./noir.css";
import "./noir-motion.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const iconVersion = "skorm-s-20261021f";

export const metadata: Metadata = {
  metadataBase: new URL("https://skorm-agency.com"),
  robots: { index: false, follow: false },
  title: "SKORM Agency · Management, communication & booking",
  description:
    "SKORM Agency accompagne les artistes dans leur management, leur communication, leurs partenariats, l'IA, la formation et leurs bookings en Europe.",
  icons: {
    icon: [
      { url: `/favicon.ico?v=${iconVersion}` },
      { url: `/favicon.png?v=${iconVersion}`, sizes: "64x64", type: "image/png" },
      { url: `/icon-192.png?v=${iconVersion}`, sizes: "192x192", type: "image/png" },
      { url: `/icon-512.png?v=${iconVersion}`, sizes: "512x512", type: "image/png" },
    ],
    shortcut: `/favicon.ico?v=${iconVersion}`,
    apple: `/apple-touch-icon.png?v=${iconVersion}`,
  },
  openGraph: {
    title: "SKORM Agency",
    description: "Management · Communication · Partnerships · AI · Training",
    type: "website",
    locale: "fr_FR",
    url: "https://www.skorm-agency.com",
    siteName: "SKORM Agency",
    images: [
      {
        url: `/skorm-share-icon.png?v=${iconVersion}`,
        width: 512,
        height: 512,
        alt: "SKORM Agency",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SKORM Agency",
    description: "Management · Communication · Partnerships · AI · Training",
    images: [`/skorm-share-icon.png?v=${iconVersion}`],
  },
  appleWebApp: {
    capable: true,
    title: "SKORM Agency",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="noir-theme">
        <div id="main-content">{children}</div>
        <SiteFooter />
        <SiteChrome />
      </body>
    </html>
  );
}
