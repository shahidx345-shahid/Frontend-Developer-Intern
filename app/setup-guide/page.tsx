"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ExternalLink, Copy, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { FIREBASE_CONFIG } from "@/lib/firebase-config"
import { DomainList } from "@/components/domain-list"

export default function SetupGuidePage() {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [currentDomain, setCurrentDomain] = useState<string>("")
  const [isPreviewEnvironment, setIsPreviewEnvironment] = useState(false)
  const [activeTab, setActiveTab] = useState("domains")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    // Get current domain for instructions
    if (typeof window !== "undefined") {
      const domain = window.location.hostname
      setCurrentDomain(domain)

      // Check if this is a preview environment
      const isPreview =
        domain.includes("vercel.app") ||
        domain.includes("netlify.app") ||
        domain.includes("github.io") ||
        domain.includes("vusercontent.net") ||
        (domain !== "localhost" && !domain.includes("127.0.0.1")) // If not localhost, likely a preview

      setIsPreviewEnvironment(isPreview)
    }
  }, [reloadKey])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const refreshDomainInfo = () => {
    setReloadKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/")} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>
      </div>

      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isPreviewEnvironment && (
          <motion.div
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-800">Preview Environment Detected: {currentDomain}</h3>
                <p className="mt-1 text-amber-700">
                  You're currently using a preview environment. Google Sign-In won't work until you add this domain to
                  your Firebase authorized domains list or deploy to your production domain.
                </p>
                <div className="mt-3 p-3 bg-white rounded border border-amber-200">
                  <p className="font-medium text-amber-800">To authorize this preview domain:</p>
                  <ol className="mt-2 ml-5 list-decimal text-amber-700 space-y-1">
                    <li>Go to the Firebase Console</li>
                    <li>Navigate to Authentication &gt; Settings</li>
                    <li>Find the "Authorized domains" section</li>
                    <li>Click "Add domain"</li>
                    <li>
                      Enter: <span className="font-mono bg-amber-100 px-1 py-0.5 rounded">{currentDomain}</span>
                    </li>
                    <li>Click "Add"</li>
                  </ol>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" onClick={refreshDomainInfo} className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Domain Info
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Firebase Setup Guide
            </CardTitle>
            <CardDescription>
              Follow these steps to properly configure your Firebase project for authentication
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="domains">Authorized Domains</TabsTrigger>
                <TabsTrigger value="google">Google Authentication</TabsTrigger>
                <TabsTrigger value="fcm">Push Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="domains" className="space-y-6">
                <DomainList />

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Step 1: Access Firebase Authentication Settings</div>
                  <div className="p-4 space-y-3">
                    <p>
                      Go to the{" "}
                      <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline inline-flex items-center"
                      >
                        Firebase Console <ExternalLink className="h-3 w-3 ml-1" />
                      </a>{" "}
                      and select your project.
                    </p>
                    <p>Navigate to "Authentication" in the left sidebar menu.</p>
                    <p>Click on the "Settings" tab at the top.</p>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Step 2: Add Your Domain to Authorized Domains</div>
                  <div className="p-4 space-y-3">
                    <p>
                      In the "Authorized domains" section, you'll see a list of domains that can use Firebase
                      Authentication.
                    </p>
                    <p>Click the "Add domain" button.</p>
                    <p>
                      Enter your domain:{" "}
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{currentDomain}</span>
                    </p>
                    <p>Click "Add" to save the domain.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="google" className="space-y-6">
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Step 1: Access Firebase Authentication</div>
                  <div className="p-4 space-y-3">
                    <p>
                      Go to the{" "}
                      <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline inline-flex items-center"
                      >
                        Firebase Console <ExternalLink className="h-3 w-3 ml-1" />
                      </a>{" "}
                      and select your project.
                    </p>
                    <p>Navigate to "Authentication" in the left sidebar menu.</p>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Step 2: Enable Google Sign-in Method</div>
                  <div className="p-4 space-y-3">
                    <p>Click on the "Sign-in method" tab.</p>
                    <p>Find "Google" in the list of providers and click the edit icon (pencil).</p>
                    <p>Toggle the "Enable" switch to the on position.</p>
                    <p>
                      Add a "Project support email" (this is required and should be your email or a team email address).
                    </p>
                    <p>Click "Save" to confirm the changes.</p>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Your Firebase Configuration</div>
                  <div className="p-4 space-y-3">
                    <p>Here's your current Firebase configuration:</p>
                    <div className="bg-gray-50 p-3 rounded-md relative font-mono text-sm overflow-auto">
                      <pre>
                        {JSON.stringify(
                          {
                            apiKey: FIREBASE_CONFIG.apiKey,
                            authDomain: FIREBASE_CONFIG.authDomain,
                            projectId: FIREBASE_CONFIG.projectId,
                            storageBucket: FIREBASE_CONFIG.storageBucket,
                            messagingSenderId: FIREBASE_CONFIG.messagingSenderId,
                            appId: FIREBASE_CONFIG.appId,
                            measurementId: FIREBASE_CONFIG.measurementId,
                          },
                          null,
                          2,
                        )}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(
                              {
                                apiKey: FIREBASE_CONFIG.apiKey,
                                authDomain: FIREBASE_CONFIG.authDomain,
                                projectId: FIREBASE_CONFIG.projectId,
                                storageBucket: FIREBASE_CONFIG.storageBucket,
                                messagingSenderId: FIREBASE_CONFIG.messagingSenderId,
                                appId: FIREBASE_CONFIG.appId,
                                measurementId: FIREBASE_CONFIG.measurementId,
                              },
                              null,
                              2,
                            ),
                            "config",
                          )
                        }
                      >
                        {copied === "config" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fcm" className="space-y-6">
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Step 1: Access Firebase Cloud Messaging</div>
                  <div className="p-4 space-y-3">
                    <p>
                      Go to the{" "}
                      <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline inline-flex items-center"
                      >
                        Firebase Console <ExternalLink className="h-3 w-3 ml-1" />
                      </a>{" "}
                      and select your project.
                    </p>
                    <p>Click on the gear icon ⚙️ next to "Project Overview" to access Project settings.</p>
                    <p>Navigate to the "Cloud Messaging" tab.</p>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Step 2: Generate Web Push Certificate</div>
                  <div className="p-4 space-y-3">
                    <p>In the "Web configuration" section, find "Web Push certificates".</p>
                    <p>Click "Generate key pair" to create a new VAPID key.</p>
                    <p>Copy the generated key - this is your VAPID key for web push notifications.</p>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Step 3: Add VAPID Key to Your Configuration</div>
                  <div className="p-4 space-y-3">
                    <p>Add the VAPID key to your Firebase configuration in the code:</p>
                    <div className="bg-gray-50 p-3 rounded-md relative font-mono text-sm">
                      <pre className="overflow-x-auto">
                        {`// In lib/firebase-config.ts
export const FIREBASE_CONFIG: FirebaseConfigType = {
  // ... your existing config
  vapidKey: "YOUR_VAPID_KEY_HERE",
}`}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() =>
                          copyToClipboard(
                            `// In lib/firebase-config.ts
export const FIREBASE_CONFIG: FirebaseConfigType = {
  // ... your existing config
  vapidKey: "YOUR_VAPID_KEY_HERE",
}`,
                            "vapid",
                          )
                        }
                      >
                        {copied === "vapid" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-blue-50 to-purple-50 flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
            <Button
              onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
              className="flex items-center"
            >
              Open Firebase Console
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
