import type { Metadata } from "next";
import { JetBrains_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "X Stock Sentinel | Real-Time Stock Sentiment from X",
  description:
    "Analyze real-time stock sentiment and momentum from X/Twitter discussions. Catch trends before they run with AI-powered sentiment analysis.",
  keywords: [
    "stock sentiment",
    "twitter stocks",
    "x stock analysis",
    "trading sentiment",
    "market sentiment",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jetbrainsMono.variable} ${ibmPlexSans.variable} antialiased bg-terminal-bg text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
