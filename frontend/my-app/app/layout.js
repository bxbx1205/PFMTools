import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import ClientLayout from "./ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://pfmtools.app'),
  title: {
    default: 'PFM Tools - AI-Powered Personal Finance Management',
    template: '%s | PFM Tools'
  },
  description: 'Advanced AI-powered personal finance management platform with smart analytics, expense tracking, debt management, and predictive insights to optimize your financial future.',
  keywords: [
    'personal finance',
    'AI finance',
    'expense tracking',
    'debt management',
    'financial analytics',
    'budget planning',
    'investment tracking',
    'financial insights',
    'money management',
    'financial planning'
  ],
  authors: [{ name: 'PFM Tools Team' }],
  creator: 'PFM Tools',
  publisher: 'PFM Tools',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/pfmlogo.png', sizes: '32x32', type: 'image/png' },
      { url: '/pfmlogo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/pfmlogo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/pfmlogo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pfmtools.app',
    siteName: 'PFM Tools',
    title: 'PFM Tools - AI-Powered Personal Finance Management',
    description: 'Advanced AI-powered personal finance management platform with smart analytics, expense tracking, debt management, and predictive insights.',
    images: [
      {
        url: '/pfmlogo.png',
        width: 1200,
        height: 630,
        alt: 'PFM Tools - AI-Powered Finance Management',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pfmtools',
    creator: '@pfmtools',
    title: 'PFM Tools - AI-Powered Personal Finance Management',
    description: 'Advanced AI-powered personal finance management platform with smart analytics and predictive insights.',
    images: ['/pfmlogo.png'],
  },
  applicationName: 'PFM Tools',
  referrer: 'origin-when-cross-origin',
  category: 'Finance',
  classification: 'Personal Finance Management',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  colorScheme: 'dark light',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#8b5cf6',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "PFM Tools",
              "description": "AI-powered personal finance management platform with smart analytics, expense tracking, and predictive insights.",
              "url": "https://pfmtools.app",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "PFM Tools Team"
              },
              "provider": {
                "@type": "Organization",
                "name": "PFM Tools",
                "url": "https://pfmtools.app"
              },
              "featureList": [
                "AI-powered financial analytics",
                "Expense tracking and categorization",
                "Debt management and optimization",
                "Predictive financial insights",
                "Budget planning and monitoring",
                "Transaction management",
                "Financial goal tracking"
              ],
              "screenshot": "https://pfmtools.app/pfmlogo.png",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              }
            }),
          }}
        />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6381610882271883"
          crossOrigin="anonymous"
        ></script>
        <script type="text/javascript">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement(
                {
                  pageLanguage: 'en',
                  includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh-CN,ar,hi',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                },
                'google_translate_element'
              );
            }
          `}
        </script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="google_translate_element" className="fixed top-6 right-6 z-50"></div>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
