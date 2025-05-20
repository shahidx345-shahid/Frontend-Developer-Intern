"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { getFirebaseAnalytics } from "@/lib/firebase"
import { logEvent } from "firebase/analytics"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const init = async () => {
        const analytics = await getFirebaseAnalytics()

        if (analytics) {
          // Log page view event
          logEvent(analytics, "page_view", {
            page_path: pathname,
            page_location: window.location.href,
            page_title: document.title,
          })

          console.log("Analytics page_view event logged for:", pathname)
        }
      }

      init().catch(console.error)
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
