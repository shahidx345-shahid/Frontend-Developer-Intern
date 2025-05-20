"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import FirebaseDebug from "@/components/firebase-debug"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DebugPage() {
  const router = useRouter()
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    // Collect available environment variables (only public ones)
    const vars: Record<string, string | undefined> = {}

    // Check for Next.js public environment variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        vars[key] = process.env[key]
      }
    })

    setEnvVars(vars)
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/")} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <FirebaseDebug />
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {Object.keys(envVars).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(envVars).map(([key, value]) => (
                    <li key={key} className="text-sm">
                      <span className="font-mono font-medium">{key}:</span>{" "}
                      {key.includes("KEY") || key.includes("SECRET")
                        ? value
                          ? "********"
                          : "Not set"
                        : value || "Not set"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No public environment variables found.</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Browser Information</h3>
              <div className="bg-gray-50 p-4 rounded-md text-sm">
                <p>User Agent: {typeof navigator !== "undefined" ? navigator.userAgent : "Not available"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
