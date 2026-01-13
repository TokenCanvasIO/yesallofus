import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TourProvider from '@/components/TourProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YesAllofUs - Instant Affiliate Commissions on XRPL",
  description: "Pay affiliate commissions in 4 seconds, not 30 days. Instant RLUSD payouts via XRP Ledger. No custody. WordPress plugin + API.",
  keywords: ["affiliate", "commissions", "XRPL", "XRP", "RLUSD", "instant payouts", "WordPress", "WooCommerce"],
  authors: [{ name: "Mark", url: "https://yesallofus.com" }],
  creator: "YesAllofUs",
  publisher: "YesAllofUs",
  metadataBase: new URL("https://yesallofus.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://yesallofus.com",
    siteName: "YesAllofUs",
    title: "YesAllofUs - Instant Affiliate Commissions on XRPL",
    description: "Pay affiliate commissions in 4 seconds, not 30 days. Instant RLUSD payouts via XRP Ledger.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YesAllofUs - Instant Affiliate Commissions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@YesAllofUs",
    creator: "@YesAllofUs",
    title: "YesAllofUs - Instant Affiliate Commissions on XRPL",
    description: "Pay affiliate commissions in 4 seconds, not 30 days. Instant RLUSD payouts via XRP Ledger.",
    images: ["/og-image.png"],
  },
  applicationName: "YesAllofUs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d0d0d" />
        <script src="https://unpkg.com/@aspect-dev/crossmark-sdk@1.0.5/dist/umd/index.js" async></script>
        <script src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" type="module" async></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-13PHKRLJ2R"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TourProvider>
          {children}
        </TourProvider>
      </body>
    </html>
  );
}