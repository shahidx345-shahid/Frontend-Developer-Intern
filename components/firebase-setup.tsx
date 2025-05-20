"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { type FirebaseConfigType, saveFirebaseConfig, DEMO_CONFIG } from "@/lib/firebase-config"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, ChevronRight, ChevronLeft, Sparkles, AlertCircle, Info, Copy, ExternalLink } from "lucide-react"

interface FirebaseSetupProps {
  onSetupComplete: () => void
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const slideIn = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { x: -20, opacity: 0, transition: { duration: 0.2 } },
}

export default function FirebaseSetup({ onSetupComplete }: FirebaseSetupProps) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<FirebaseConfigType>({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
    vapidKey: "",
  })
  const [useDemoConfig, setUseDemoConfig] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("manual")

  // Update config when demo mode is toggled
  useEffect(() => {
    if (useDemoConfig) {
      setConfig(DEMO_CONFIG)
    } else {
      setConfig({
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: "",
        vapidKey: "",
      })
    }
  }, [useDemoConfig])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!config.apiKey) newErrors.apiKey = "API Key is required"
      if (!config.authDomain) newErrors.authDomain = "Auth Domain is required"
      if (!config.projectId) newErrors.projectId = "Project ID is required"
    }

    if (currentStep === 2) {
      if (!config.storageBucket) newErrors.storageBucket = "Storage Bucket is required"
      if (!config.messagingSenderId) newErrors.messagingSenderId = "Messaging Sender ID is required"
      if (!config.appId) newErrors.appId = "App ID is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1)
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Additional validation for API key format
    if (!config.apiKey || config.apiKey.trim() === "") {
      setErrors((prev) => ({ ...prev, apiKey: "API Key cannot be empty" }))
      toast({
        title: "Invalid API Key",
        description: "Please provide a valid Firebase API Key",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Log the configuration being saved (without showing full API key)
      console.log("Saving Firebase configuration:", {
        apiKey: config.apiKey ? `${config.apiKey.substring(0, 5)}...` : "missing",
        authDomain: config.authDomain || "missing",
        projectId: config.projectId || "missing",
      })

      // Save config to localStorage
      saveFirebaseConfig(config)

      toast({
        title: "Setup Complete",
        description: "Your Firebase configuration has been saved successfully!",
      })

      // Notify parent component that setup is complete
      onSetupComplete()
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "There was an error saving your configuration.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <motion.div className="w-full max-w-3xl" initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Firebase Setup Wizard
              </CardTitle>
            </motion.div>
            <CardDescription className="text-center text-base">
              Configure your Firebase project to enable authentication and notifications
            </CardDescription>

            <div className="flex justify-center mt-4 space-x-1">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === step ? "bg-primary" : i < step ? "bg-primary/60" : "bg-muted"
                  }`}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{
                    scale: i === step ? 1.2 : 1,
                    opacity: i === step ? 1 : i < step ? 0.8 : 0.4,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center space-x-2">
                <Switch id="demo-mode" checked={useDemoConfig} onCheckedChange={setUseDemoConfig} />
                <Label htmlFor="demo-mode" className="flex items-center cursor-pointer">
                  <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                  <span>Use demo configuration</span>
                </Label>
              </div>

              <div className="text-sm text-muted-foreground">Step {step} of 3</div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial="hidden" animate="visible" exit="exit" variants={slideIn}>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="manual">Manual Setup</TabsTrigger>
                      <TabsTrigger value="guide">Visual Guide</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="apiKey" className="flex items-center">
                          API Key <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="apiKey"
                            name="apiKey"
                            value={config.apiKey}
                            onChange={handleChange}
                            placeholder="AIzaSyC..."
                            className={errors.apiKey ? "border-red-500 pr-10" : ""}
                            disabled={useDemoConfig}
                          />
                          {errors.apiKey && (
                            <AlertCircle className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                          )}
                        </div>
                        {errors.apiKey && <p className="text-red-500 text-sm">{errors.apiKey}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="authDomain" className="flex items-center">
                          Auth Domain <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="authDomain"
                            name="authDomain"
                            value={config.authDomain}
                            onChange={handleChange}
                            placeholder="your-project-id.firebaseapp.com"
                            className={errors.authDomain ? "border-red-500 pr-10" : ""}
                            disabled={useDemoConfig}
                          />
                          {errors.authDomain && (
                            <AlertCircle className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                          )}
                        </div>
                        {errors.authDomain && <p className="text-red-500 text-sm">{errors.authDomain}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectId" className="flex items-center">
                          Project ID <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="projectId"
                            name="projectId"
                            value={config.projectId}
                            onChange={handleChange}
                            placeholder="your-project-id"
                            className={errors.projectId ? "border-red-500 pr-10" : ""}
                            disabled={useDemoConfig}
                          />
                          {errors.projectId && (
                            <AlertCircle className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                          )}
                        </div>
                        {errors.projectId && <p className="text-red-500 text-sm">{errors.projectId}</p>}
                      </div>
                    </TabsContent>

                    <TabsContent value="guide" className="space-y-4">
                      <div className="rounded-lg overflow-hidden border">
                        <div className="bg-muted p-3 text-sm font-medium">
                          Where to find your Firebase configuration
                        </div>
                        <div className="p-4 space-y-4">
                          <ol className="list-decimal pl-5 space-y-3">
                            <li>
                              Go to the{" "}
                              <a
                                href="https://console.firebase.google.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline inline-flex items-center"
                              >
                                Firebase Console <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </li>
                            <li>Select your project (or create a new one)</li>
                            <li>Click on the gear icon ⚙️ next to "Project Overview" to access Project settings</li>
                            <li>Scroll down to the "Your apps" section</li>
                            <li>If you haven't added a web app yet, click the web icon {"</>"} to add one</li>
                            <li>Your configuration values will be shown in the Firebase SDK snippet</li>
                          </ol>

                          <div className="mt-4 bg-muted/50 p-3 rounded-md text-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-mono text-xs">firebaseConfig</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() =>
                                  copyToClipboard(
                                    JSON.stringify(
                                      {
                                        apiKey: "YOUR_API_KEY",
                                        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
                                        projectId: "YOUR_PROJECT_ID",
                                        storageBucket: "YOUR_PROJECT_ID.appspot.com",
                                        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
                                        appId: "YOUR_APP_ID",
                                        measurementId: "YOUR_MEASUREMENT_ID",
                                      },
                                      null,
                                      2,
                                    ),
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <pre className="text-xs overflow-x-auto">
                              {`{
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={slideIn}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="storageBucket" className="flex items-center">
                      Storage Bucket <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="storageBucket"
                        name="storageBucket"
                        value={config.storageBucket}
                        onChange={handleChange}
                        placeholder="your-project-id.appspot.com"
                        className={errors.storageBucket ? "border-red-500 pr-10" : ""}
                        disabled={useDemoConfig}
                      />
                      {errors.storageBucket && (
                        <AlertCircle className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                    {errors.storageBucket && <p className="text-red-500 text-sm">{errors.storageBucket}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="messagingSenderId" className="flex items-center">
                      Messaging Sender ID <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="messagingSenderId"
                        name="messagingSenderId"
                        value={config.messagingSenderId}
                        onChange={handleChange}
                        placeholder="123456789012"
                        className={errors.messagingSenderId ? "border-red-500 pr-10" : ""}
                        disabled={useDemoConfig}
                      />
                      {errors.messagingSenderId && (
                        <AlertCircle className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                    {errors.messagingSenderId && <p className="text-red-500 text-sm">{errors.messagingSenderId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appId" className="flex items-center">
                      App ID <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="appId"
                        name="appId"
                        value={config.appId}
                        onChange={handleChange}
                        placeholder="1:123456789012:web:abc123def456"
                        className={errors.appId ? "border-red-500 pr-10" : ""}
                        disabled={useDemoConfig}
                      />
                      {errors.appId && (
                        <AlertCircle className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                    {errors.appId && <p className="text-red-500 text-sm">{errors.appId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurementId" className="flex items-center">
                      Measurement ID <span className="text-muted-foreground text-sm ml-1">(optional)</span>
                    </Label>
                    <Input
                      id="measurementId"
                      name="measurementId"
                      value={config.measurementId || ""}
                      onChange={handleChange}
                      placeholder="G-ABCDEF1234"
                      disabled={useDemoConfig}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={slideIn}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="vapidKey">VAPID Key</Label>
                      <div className="relative ml-2 group">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute left-0 w-64 p-2 mt-2 text-xs bg-popover border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          The VAPID key is required for web push notifications. You can generate it in the Firebase
                          Console under Project Settings &gt; Cloud Messaging &gt; Web Configuration &gt; Generate Key
                          Pair.
                        </div>
                      </div>
                    </div>
                    <Input
                      id="vapidKey"
                      name="vapidKey"
                      value={config.vapidKey || ""}
                      onChange={handleChange}
                      placeholder="BPVvFKR9W5JXs8X5QwODZnOXTHBpjAW5-Fv_YK..."
                      disabled={useDemoConfig}
                    />
                    <p className="text-sm text-muted-foreground">
                      This is needed for push notifications. You can add it later if you don't have it now.
                    </p>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Configuration Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium">API Key:</span>
                        <span className="col-span-2 font-mono truncate">
                          {config.apiKey ? `${config.apiKey.substring(0, 6)}...` : "Not set"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium">Project ID:</span>
                        <span className="col-span-2 font-mono">{config.projectId || "Not set"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium">Auth Domain:</span>
                        <span className="col-span-2 font-mono truncate">{config.authDomain || "Not set"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium">VAPID Key:</span>
                        <span className="col-span-2 font-mono">
                          {config.vapidKey ? `${config.vapidKey.substring(0, 6)}...` : "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-green-800 font-medium mb-2 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Ready to Complete Setup
                    </h3>
                    <p className="text-green-700 text-sm">
                      Your Firebase configuration is ready. Click "Complete Setup" to save your configuration and
                      continue to the app.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" onClick={prevStep} disabled={step === 1} className="w-28">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <AnimatePresence mode="wait">
              {step < 3 ? (
                <motion.div key="next" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button onClick={nextStep} className="w-28">
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button onClick={handleSubmit} className="w-40 relative overflow-hidden group" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="opacity-0">Complete Setup</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <span className="absolute right-0 h-full w-12 -translate-x-12 bg-gradient-to-r from-transparent to-white/20 skew-x-[30deg] group-hover:animate-shimmer" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
