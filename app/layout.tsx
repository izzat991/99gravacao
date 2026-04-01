import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFE323',
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: '99 Motorista e Entregador',
  description: 'App para motoristas e entregadores 99',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '99 Motorista',
  },
  icons: {
    icon: [
      {
        url: '/images/logo-99.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
    ],
    apple: '/images/logo-99.webp',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/images/logo-99.webp" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="99 Motorista" />
        {/* Safe area for Dynamic Island and notch */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased bg-[#f5f0e8]">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
