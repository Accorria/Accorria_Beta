import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Accorria – #1 Trust-Native AI Listings with Escrow',
  description:
    'Accorria helps you sell cars and homes faster with AI-powered listings, multi-platform posting, automated negotiation, and secure escrow transactions. Upload photos, we\'ll flip the rest.',
  icons: {
    icon: '/AccorriaYwLOGO.png',
    apple: '/AccorriaYwLOGO.png',
  },
  openGraph: {
    title: 'Accorria – #1 Trust-Native AI Listings with Escrow',
    description:
      'Upload photos, we\'ll flip the rest. Accorria automates car & home sales with AI, escrow, and predictive insights.',
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
    title: 'Accorria – #1 Trust-Native AI Listings with Escrow',
    description:
      'AI-powered listings, secure escrow, and multi-platform posting. Upload photos, we\'ll flip the rest.',
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
              description: 'AI-powered car and home listing platform with secure escrow transactions',
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
      >
        <AuthProvider>
          <ThemeProvider>
            <ScrollToTop />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
