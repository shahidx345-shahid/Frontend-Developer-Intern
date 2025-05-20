"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, getRedirectResult } from "firebase/auth"
import { initializeFirebase } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"

export default function AuthRedirectPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        // Initialize Firebase
        initializeFirebase()
        const auth = getAuth()

        // Get the redirect result
        const result = await getRedirectResult(auth)

        if (result?.user) {
          // User is signed in
          console.log("Redirect sign-in successful:", result.user.email)

          toast({
            title: "Sign In Successful",
            description: "You've successfully signed in with Google",
          })

          // Redirect to dashboard
          router.push("/dashboard")
        } else {
          // No redirect result, redirect to home
          console.log("No redirect result, redirecting to home")
          router.push("/")
        }
      } catch (error: any) {
        console.error("Redirect sign-in error:", error)
        setError(error.message || "An error occurred during sign-in")

        setTimeout(() => {
          router.push("/")
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    handleRedirectResult()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          {loading ? (
            <>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <div
                  className="absolute inset-2 rounded-full border-t-2 border-primary/70 animate-spin"
                  style={{ animationDuration: "1.5s" }}
                ></div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Completing Sign In</h2>
              <p className="text-muted-foreground">Please wait while we complete your Google sign-in...</p>
            </>
          ) : error ? (
            <>
              <div className="bg-red-100 p-4 rounded-lg mb-4 text-red-800">
                <h2 className="text-xl font-bold mb-2">Sign In Error</h2>
                <p>{error}</p>
                <p className="text-sm mt-2">Redirecting to home page...</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-100 p-4 rounded-lg mb-4 text-green-800">
                <h2 className="text-xl font-bold mb-2">Sign In Successful</h2>
                <p>You've successfully signed in with Google.</p>
                <p className="text-sm mt-2">Redirecting to dashboard...</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
