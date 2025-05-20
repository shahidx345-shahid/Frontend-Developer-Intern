"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AuthPage from "@/components/auth-page"
import { initializeFirebase } from "@/lib/firebase"
import { Loader2 } from "lucide-react"
import { FIREBASE_CONFIG } from "@/lib/firebase-config"
import Link from "next/link"

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configPresent, setConfigPresent] = useState(true)

  useEffect(() => {
    // Verify configuration before attempting to initialize Firebase
    if (!FIREBASE_CONFIG || !FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) {
      setConfigPresent(false)
      setError("Firebase configuration is missing or incomplete")
      return
    }

    // Initialize Firebase on component mount
    try {
      initializeFirebase()
      setIsInitialized(true)
    } catch (err: any) {
      console.error("Firebase initialization error:", err)
      setError(err.message || "Failed to initialize Firebase")
    }
  }, [])

  // Show error if configuration is missing
  if (!configPresent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Firebase Configuration Missing</h2>
          <p className="mb-4">
            Your Firebase configuration appears to be missing or incomplete. Make sure your configuration is properly
            set in <code className="bg-gray-100 px-2 py-1 rounded">lib/firebase-config.ts</code>.
          </p>
          <Link href="/setup-guide" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center">
            View Firebase Setup Guide
          </Link>
        </div>
      </div>
    )
  }

  // Show loading state while initializing
  if (!isInitialized && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div
              className="absolute inset-2 rounded-full border-t-2 border-primary/70 animate-spin"
              style={{ animationDuration: "1.5s" }}
            ></div>
            <div
              className="absolute inset-4 rounded-full border-t-2 border-primary/40 animate-spin"
              style={{ animationDuration: "2s" }}
            ></div>
          </div>
          <p className="mt-6 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            Initializing Firebase...
          </p>
        </motion.div>
      </div>
    )
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <div className="w-full max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-red-800 text-xl font-bold mb-2">Firebase Initialization Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded transition-colors"
              >
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4" />
                  <span>Retry</span>
                </div>
              </button>
              <Link
                href="/debug"
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded transition-colors"
              >
                Debug
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show auth page if Firebase is initialized
  return (
    <AnimatePresence mode="wait">
      <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <AuthPage />
      </motion.div>
    </AnimatePresence>
  )
}
