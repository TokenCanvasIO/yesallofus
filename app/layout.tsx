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
  icon: "/favicon.ico",
  apple: "/apple-touch-icon.png",
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
  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <meta name="theme-color" content="#0d0d0d" />
        <script src="https://unpkg.com/@crossmarkio/sdk/dist/umd/index.js" crossOrigin="anonymous" async></script>
        <script src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" crossOrigin="anonymous" type="module" async></script>
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
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var noop = function() {};
                  console.log = noop;
                  console.warn = noop;
                  console.debug = noop;
                })();
              `,
            }}
          />
        )}
        <TourProvider>
          {children}
        </TourProvider>
      </body>
    </html>
  );
}