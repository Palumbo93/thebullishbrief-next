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
        {/* Performance: Preconnect to critical origins */}
        <link rel="preconnect" href="https://potsdvyvpwuycgocpivf.supabase.co" />
        <link rel="preconnect" href="https://s3.tradingview.com" />
        <link rel="preconnect" href="https://www.tradingview-widget.com" />
        <link rel="preconnect" href="https://s3-symbol-logo.tradingview.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        
        {/* Microsoft Clarity - Analytics & Heatmaps (Cookie-Free) - Block on bull-room pages */}
        <script type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              // Only load if NOT on bull-room pages
              if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/bull-room')) {
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  
                  // Configure for analytics + heatmaps while maintaining privacy
                  c[a]('set', 'cookies', false);
                  // Enable Smart Events and custom event tracking (removed track: false)
                })(window, document, "clarity", "script", "t0h9wf1q4x");
              }
            `
          }}
        />
      </head>
      <body className={`${archivo.variable}`}>
        <ClientProviders>
          <AppContent>
            {children}
          </AppContent>
        </ClientProviders>
      </body>
    </html>
  )
}
