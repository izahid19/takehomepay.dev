import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Freelance Take Home Pay Calculator | Net Income After Fees & Tax",
  description:
    "Free freelance take home pay calculator. Calculate your net income after platform fees and taxes instantly. Perfect for Upwork, Fiverr, Toptal freelancers.",
  keywords: [
    "freelance take home pay calculator",
    "hourly rate calculator freelancer",
    "freelance income after tax",
    "net income calculator freelancer",
    "freelance earnings calculator",
    "self employed income calculator",
    "contractor pay calculator",
    "upwork income calculator",
    "fiverr earnings calculator",
  ],
  authors: [{ name: "Zahid Mushtaq", url: "https://devzahid.vercel.app/" }],
  openGraph: {
    title: "Freelance Take Home Pay Calculator | Free & Instant",
    description:
      "Calculate your real freelance income after platform fees and taxes. Free, instant, no signup required.",
    type: "website",
    url: "https://takehomepay.dev",
    siteName: "takehomepay.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Take Home Pay Calculator",
    description:
      "Free calculator for freelancers to know their real income after fees and taxes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://takehomepay.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://takehomepay.dev" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
