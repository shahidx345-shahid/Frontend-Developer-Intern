"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getFirebaseConfig, type FirebaseConfigType } from "@/lib/firebase-config"
import { toast } from "@/components/ui/use-toast"
import { getApps, initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function FirebaseDebug() {
  const [testResults, setTestResults] = useState<{
    configValid: boolean
    firebaseInitialized: boolean
    authAvailable: boolean
    googleProviderAvailable: boolean
    apiKeyValid?: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<FirebaseConfigType | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    const results = {
      configValid: false,
      firebaseInitialized: false,
      authAvailable: false,
      googleProviderAvailable: false,
      apiKeyValid: false,
    }

    try {
      // Check config
      const firebaseConfig = getFirebaseConfig()
      setConfig(firebaseConfig)

      results.configValid = !!(
        firebaseConfig &&
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId
      )

      if (!results.configValid) {
        setTestResults(results)
        return
      }

      // Check Firebase initialization
      const apps = getApps()
      results.firebaseInitialized = apps.length > 0

      let app
      if (!results.firebaseInitialized) {
        try {
          app = initializeApp(firebaseConfig!)
          results.firebaseInitialized = true
        } catch (error) {
          console.error("Failed to initialize Firebase during diagnostics:", error)
        }
      } else {
        app = apps[0]
      }

      // Check Auth
      try {
        const auth = getAuth()
        results.authAvailable = !!auth
      } catch (error) {
        console.error("Failed to get Auth during diagnostics:", error)
      }

      // Check Google Provider
      try {
        new GoogleAuthProvider()
        results.googleProviderAvailable = true
      } catch (error) {
        console.error("Failed to create Google provider during diagnostics:", error)
      }

      // Test API key validity
      if (results.authAvailable) {
        try {
          const auth = getAuth()
          // We don't actually sign in, just check if the auth object has a valid API key
          results.apiKeyValid = !!auth.app.options.apiKey
        } catch (error) {
          console.error("API key validation failed:", error)
        }
      }
    } catch (error) {
      console.error("Diagnostics error:", error)
      toast({
        title: "Diagnostics Failed",
        description: "An error occurred while running diagnostics.",
        variant: "destructive",
      })
    } finally {
      setTestResults(results)
      setLoading(false)
    }
  }

  const resetConfig = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("firebaseConfig")
      toast({
        title: "Configuration Reset",
        description: "Firebase configuration has been reset. Please refresh the page.",
      })
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-amber-50">
        <CardTitle className="text-amber-800">Firebase Diagnostics</CardTitle>
        <CardDescription className="text-amber-700">Troubleshoot your Firebase configuration</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <Button onClick={runDiagnostics} className="w-full" disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            "Run Diagnostics"
          )}
        </Button>

        {testResults && (
          <div className="space-y-3 mt-4">
            <h3 className="font-medium">Diagnostic Results:</h3>

            <div className="space-y-2">
              <div className="flex items-center">
                {testResults.configValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>Firebase Configuration: {testResults.configValid ? "Valid" : "Invalid"}</span>
              </div>

              <div className="flex items-center">
                {testResults.firebaseInitialized ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>Firebase Initialization: {testResults.firebaseInitialized ? "Success" : "Failed"}</span>
              </div>

              <div className="flex items-center">
                {testResults.authAvailable ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>Auth Service: {testResults.authAvailable ? "Available" : "Unavailable"}</span>
              </div>

              <div className="flex items-center">
                {testResults.googleProviderAvailable ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>Google Provider: {testResults.googleProviderAvailable ? "Available" : "Unavailable"}</span>
              </div>

              {testResults.apiKeyValid !== undefined && (
                <div className="flex items-center">
                  {testResults.apiKeyValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>API Key: {testResults.apiKeyValid ? "Valid" : "Invalid"}</span>
                </div>
              )}
            </div>

            {config && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                <h4 className="font-medium mb-2">Configuration Details:</h4>
                <ul className="space-y-1">
                  <li>API Key: {config.apiKey ? `${config.apiKey.substring(0, 5)}...` : "Missing"}</li>
                  <li>Auth Domain: {config.authDomain || "Missing"}</li>
                  <li>Project ID: {config.projectId || "Missing"}</li>
                  <li>Storage Bucket: {config.storageBucket || "Missing"}</li>
                  <li>Messaging Sender ID: {config.messagingSenderId || "Missing"}</li>
                  <li>App ID: {config.appId ? "Present" : "Missing"}</li>
                  <li>VAPID Key: {config.vapidKey ? "Present" : "Missing"}</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={resetConfig} className="w-full">
          Reset Configuration
        </Button>
      </CardFooter>
    </Card>
  )
}
