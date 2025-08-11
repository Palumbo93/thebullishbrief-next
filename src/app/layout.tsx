import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import './globals.css'
import '../styles/design-system.css'

// Providers
import { Providers } from '../components/Providers'
import { AppContent } from '../components/AppContent'

const archivo = Archivo({ 
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Bullish Brief',
  description: 'Your daily dose of bullish market insights and financial analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${archivo.variable}`}>
        <Providers>
          <AppContent>
            {children}
          </AppContent>
        </Providers>
      </body>
    </html>
  )
}
