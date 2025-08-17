import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import './globals.css'
import '../styles/design-system.css'

// Providers
import { ClientProviders } from '../components/ClientProviders'
import { AppContent } from '../components/AppContent'

const archivo = Archivo({ 
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Bullish Brief',
  description: 'Your daily dose of bullish market insights and financial analysis',
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'The Bullish Brief',
    description: 'Your daily dose of bullish market insights and financial analysis',
    url: 'https://bullishbrief.com',
    siteName: 'The Bullish Brief',
    images: [
      {
        url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
        width: 1200,
        height: 630,
        alt: 'The Bullish Brief - Your daily dose of bullish market insights and financial analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Bullish Brief',
    description: 'Your daily dose of bullish market insights and financial analysis',
    images: ['https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The Bullish Brief',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'The Bullish Brief',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Datafa.st Analytics */}
        <script 
          async 
          src="https://datafa.st/js/script.js" 
          data-website-id="689dde00a1c832b545b78a9f"
          data-domain="thebullishbrief.com"
        />
      </head>
      <body className={`${archivo.variable}`}>
        <ClientProviders>
          <AppContent>
            {children}
          </AppContent>
        </ClientProviders>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </body>
    </html>
  )
}
