import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Accorria – #1 Trust-Native Listing Platform',
  description:
    'The future of selling starts here. Secure listings, instant escrow, and AI-powered posting for cars, homes, and high-value items. Upload photos, we\'ll flip the rest.',
  icons: {
    icon: '/AccorriaYwLOGO.png',
    apple: '/AccorriaYwLOGO.png',
  },
  openGraph: {
    title: 'Accorria – #1 Trust-Native Listing Platform',
    description:
      'The future of selling starts here. Secure listings, instant escrow, and AI-powered posting for cars, homes, and high-value items.',
    url: 'https://accorria.com',
    siteName: 'Accorria',
    images: [
      {
        url: 'https://accorria.com/AccorriaYwLOGO.png',
        width: 800,
        height: 600,
        alt: 'Accorria Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accorria – #1 Trust-Native Listing Platform',
    description:
      'The future of selling starts here. Secure listings, instant escrow, and AI-powered posting for cars, homes, and high-value items.',
    images: ['https://accorria.com/AccorriaYwLOGO.png'],
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
        <link rel="icon" href="/AccorriaYwLOGO.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Accorria',
              url: 'https://accorria.com',
              logo: 'https://accorria.com/AccorriaYwLOGO.png',
              description: 'The future of selling starts here. Secure listings, instant escrow, and AI-powered posting for cars, homes, and high-value items.',
              sameAs: [
                'https://www.facebook.com/accorria',
                'https://www.linkedin.com/company/accorria',
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <ScrollToTop />
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
