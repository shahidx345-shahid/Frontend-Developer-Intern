"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth"
import { toast } from "@/components/ui/use-toast"
import { ChromeIcon as Google, Loader2, AlertTriangle, Info, ExternalLink, CheckCircle } from "lucide-react"
import { initializeFirebase } from "@/lib/firebase"
import Link from "next/link"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
}

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [currentDomain, setCurrentDomain] = useState<string>("")
  const [isPreviewEnvironment, setIsPreviewEnvironment] = useState(false)
  const [auth, setAuth] = useState<any>(null)
  const [showGoogleGuide, setShowGoogleGuide] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      // Initialize Firebase and auth
      const app = initializeFirebase()
      const authInstance = getAuth(app)
      setAuth(authInstance)

      // Check if user is already signed in
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) {
          router.push("/dashboard")
        }
      })

      // Get current domain for error messages
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

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up auth:", error)
      toast({
        title: "Authentication Error",
        description: "There was an error setting up authentication. Please refresh and try again.",
        variant: "destructive",
      })
    }
  }, [router])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      toast({
        title: "Authentication Error",
        description: "Authentication is not initialized. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)

      toast({
        title: "Sign In Successful",
        description: "Welcome back!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Sign in error:", error)

      let errorMessage = "Failed to sign in. Please check your credentials."
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please enter a valid email."
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid credentials. Please check your email and password."
      }

      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      toast({
        title: "Authentication Error",
        description: "Authentication is not initialized. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await createUserWithEmailAndPassword(auth, email, password)

      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Sign up error:", error)

      let errorMessage = "Failed to create account."
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use. Please try another email or sign in."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please enter a valid email."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password."
      }

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        title: "Authentication Error",
        description: "Authentication is not initialized. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    // For preview environments, suggest redirection to production
    if (isPreviewEnvironment) {
      const useEmailPassword = window.confirm(
        "Google Sign-In is not available in preview environments due to Firebase security restrictions. Would you like to use email/password authentication instead?",
      )

      if (!useEmailPassword) {
        toast({
          title: "Authentication Method",
          description: "Please use email/password authentication in preview environments.",
          variant: "default",
        })
      }
      return
    }

    setGoogleLoading(true)
    setGoogleError(null)

    try {
      // Configure Google provider to handle cross-origin isolation issues
      const provider = new GoogleAuthProvider()

      // Add custom parameters for better compatibility
      provider.setCustomParameters({
        prompt: "select_account",
      })

      // Try sign-in with popup first
      try {
        await signInWithPopup(auth, provider)

        toast({
          title: "Sign In Successful",
          description: "Welcome back!",
        })

        router.push("/dashboard")
      } catch (popupError: any) {
        console.error("Popup sign-in error:", popupError)

        // If popup is blocked, try redirect method
        if (popupError.code === "auth/popup-blocked") {
          toast({
            title: "Popup Blocked",
            description: "Using redirect method instead. You'll be redirected to Google's sign-in page.",
            variant: "default",
          })

          // Use redirect method
          await signInWithRedirect(auth, provider)
          // The result will be handled in the /auth/redirect page
        } else {
          throw popupError
        }
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)

      let errorMessage = "Failed to sign in with Google."

      if (error.code === "auth/configuration-not-found") {
        errorMessage = "Google authentication is not configured in your Firebase project."
        setGoogleError(
          "Google Sign-In is not enabled in your Firebase project. Please enable it in the Firebase Console under Authentication > Sign-in method > Google.",
        )
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage = `The domain "${currentDomain}" is not authorized for OAuth operations.`
        setGoogleError(
          `Your current domain "${currentDomain}" is not authorized for Google Sign-In. Add this domain to your authorized domains list in Firebase Console under Authentication > Settings > Authorized domains.`,
        )
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed. Please try again."
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Multiple popup requests. Please try again."
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked by your browser. Please allow popups for this site."
      }

      toast({
        title: "Google Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
        <Card className="border-2 shadow-lg overflow-hidden">
          <motion.div variants={itemVariants}>
            <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome
              </CardTitle>
              <CardDescription className="text-center">Sign in or create an account to continue</CardDescription>
            </CardHeader>
          </motion.div>

          {isPreviewEnvironment && (
            <motion.div
              className="px-6 py-3 bg-blue-50 border-y border-blue-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Preview Environment Detected: {currentDomain}</p>
                  <p className="mt-1">
                    Google Sign-In may not work in preview environments. Please use email/password authentication or
                    deploy to an authorized domain.
                  </p>
                  <Link
                    href="/setup-guide"
                    className="text-blue-600 hover:text-blue-800 underline inline-flex items-center mt-2"
                  >
                    View Setup Guide <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <motion.div variants={itemVariants}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              <AnimatePresence mode="wait">
                {activeTab === "signin" && (
                  <TabsContent value="signin" className="space-y-4 mt-0">
                    <motion.form
                      onSubmit={handleEmailSignIn}
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div className="space-y-2" variants={itemVariants}>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div className="space-y-2" variants={itemVariants}>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Button type="submit" className="w-full relative overflow-hidden group" disabled={loading}>
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <span>Sign In</span>
                              <span className="absolute right-0 h-full w-12 -translate-x-12 bg-gradient-to-r from-transparent to-white/20 skew-x-[30deg] group-hover:animate-shimmer" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </TabsContent>
                )}

                {activeTab === "signup" && (
                  <TabsContent value="signup" className="space-y-4 mt-0">
                    <motion.form
                      onSubmit={handleEmailSignUp}
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div className="space-y-2" variants={itemVariants}>
                        <Label htmlFor="email-signup">Email</Label>
                        <Input
                          id="email-signup"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div className="space-y-2" variants={itemVariants}>
                        <Label htmlFor="password-signup">Password</Label>
                        <Input
                          id="password-signup"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Button type="submit" className="w-full relative overflow-hidden group" disabled={loading}>
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <span>Create Account</span>
                              <span className="absolute right-0 h-full w-12 -translate-x-12 bg-gradient-to-r from-transparent to-white/20 skew-x-[30deg] group-hover:animate-shimmer" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </TabsContent>
                )}
              </AnimatePresence>

              {googleError && (
                <motion.div
                  className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Google Sign-In Configuration Error</p>
                      <p className="mt-1">{googleError}</p>
                      <div className="mt-2 flex space-x-2">
                        <Link
                          href="/setup-guide"
                          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                        >
                          View Setup Guide
                        </Link>
                        <a
                          href="https://console.firebase.google.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                        >
                          Firebase Console <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="mt-6">
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full relative overflow-hidden group"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || isPreviewEnvironment}
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Google className="mr-2 h-4 w-4 text-red-500" />
                      <span>{isPreviewEnvironment ? "Google Sign-In (Unavailable in Preview)" : "Google"}</span>
                      <span className="absolute right-0 h-full w-12 -translate-x-12 bg-gradient-to-r from-transparent to-black/5 skew-x-[30deg] group-hover:animate-shimmer" />
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setShowGoogleGuide(!showGoogleGuide)}
                >
                  {showGoogleGuide ? "Hide Google Sign-In Guide" : "How does Google Sign-In work?"}
                </Button>

                <AnimatePresence>
                  {showGoogleGuide && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Google className="h-4 w-4 text-red-500 mr-2" />
                          Google Sign-In Process
                        </h4>
                        <ol className="list-decimal ml-5 space-y-1">
                          <li>Click the "Google" button above</li>
                          <li>A popup window will appear</li>
                          <li>Select your Google account</li>
                          <li>Authorize the application</li>
                          <li>You'll be automatically signed in</li>
                        </ol>
                        <div className="mt-3 flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <p>
                            Google Sign-In is more secure and convenient as you don't need to remember another password.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Tabs>
          </CardContent>

          <motion.div variants={itemVariants}>
            <CardFooter className="flex flex-col bg-gradient-to-r from-blue-50 to-purple-50">
              <p className="text-xs text-center text-muted-foreground mt-2">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}
