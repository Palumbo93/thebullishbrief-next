import type { Metadata, Viewport } from 'next'
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
  title: 'The Bullish Brief - Independent Market Intelligence for Investors',
  description: 'News, deep dives, and opinions on market trends, company developments, and economic shifts, giving investors timely updates and clear context.',
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'The Bullish Brief - Independent Market Intelligence for Investors',
    description: 'News, deep dives, and opinions on market trends, company developments, and economic shifts, giving investors timely updates and clear context.',
    url: 'https://bullishbrief.com',
    siteName: 'The Bullish Brief',
    images: [
      {
        url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/websiteimages/BullishBrief.png',
        width: 1200,
        height: 630,
        alt: 'The Bullish Brief - Independent Market Intelligence for Investors',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Bullish Brief - Independent Market Intelligence for Investors',
    description: 'News, deep dives, and opinions on market trends, company developments, and economic shifts, giving investors timely updates and clear context.',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fafafa',
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
        {/* <link rel="preconnect" href="https://www.googletagmanager.com" /> */}
        <link rel="preconnect" href="https://www.clarity.ms" />
        
        {/* Microsoft Clarity */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "t0h9wf1q4x");
            `
          }}
        />

        {/* Google Tag Manager */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-TJWNG6WZ');
            `
          }}
        /> */}
      </head>
      <body className={`${archivo.variable}`}>
        {/* Google Tag Manager (noscript) */}
        {/* <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TJWNG6WZ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript> */}
        
        <ClientProviders>
          <AppContent>
            {children}
          </AppContent>
        </ClientProviders>
      </body>
    </html>
  )
}
