import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider>
            <AnalyticsProvider>
              {children}
              <Toaster />
            </AnalyticsProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'Your App Name',
  description: 'Your app description',
  viewport: {
    width: 'device-width',
    initialScale: 1
  }
}
