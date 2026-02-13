import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pitchdown | AI Proposal Generator & Freelance Income Tool",
  description:
    "Win more clients with Pitchdown’s AI proposal generator, personalized for Upwork & LinkedIn. Calculate real take-home pay after fees and taxes. Start for free.",
  keywords: [
    "AI Proposal Generator for Freelancers",
    "Pitchdown AI",
    "Freelance Income Calculator",
    "Upwork Proposal Generator",
    "LinkedIn Proposal Tool",
    "Fiverr Proposal Writer",
    "Freelance Take-Home Pay Calculator",
    "AI-Powered Proposal Intelligence",
    "freelance net income calculator",
    "how to win more Upwork jobs with AI",
    "personalized proposals for LinkedIn outreach",
    "AI tools for solopreneurs",
    "best AI proposal writing software",
  ],
  authors: [{ name: "Zahid Mushtaq", url: "https://devzahid.in" }],
  openGraph: {
    title: "Pitchdown — Stop Pitching, Start Winning.",
    description:
      "The ultimate freelance intelligence platform. AI-powered proposals and real-time income calculation for modern solopreneurs.",
    type: "website",
    url: "https://pitchdown.in",
    siteName: "Pitchdown",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pitchdown — Stop Pitching, Start Winning.",
    description:
      "Generate winning proposals in seconds. Pitchdown is the AI secret weapon for Upwork and LinkedIn freelancers. Win more, earn more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://pitchdown.in",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

import { AuthProvider } from "@/hooks/useAuth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://pitchdown.in" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Pitchdown",
              "url": "https://pitchdown.in",
              "logo": "https://pitchdown.in/logo.png",
              "sameAs": [
                "https://twitter.com/pitchdown",
                "https://linkedin.com/company/pitchdown"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://pitchdown.in",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://pitchdown.in/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Pitchdown",
              "operatingSystem": "Web",
              "applicationCategory": "BusinessApplication",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1250"
              },
              "description": "AI-powered proposal generator and freelance income intelligence tool for Upwork, LinkedIn, and direct clients."
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How does the Pitchdown AI proposal generator work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Pitchdown uses advanced AI to analyze project descriptions and your user profile to generate highly personalized, conversion-optimized proposals for platforms like Upwork and LinkedIn."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I calculate my net income for Upwork and Fiverr?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, our freelance income calculator automatically accounts for platform fees (10-20%) and tax estimates to show you your true take-home pay."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Pitchdown free to use?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Pitchdown offers a free tier that includes 10 AI-generated proposals and unlimited use of the income calculator, with no credit card required."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
