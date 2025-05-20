"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { getToken, onMessage } from "firebase/messaging"
import { toast } from "@/components/ui/use-toast"
import NotificationList from "@/components/notification-list"
import {
  Bell,
  LogOut,
  Copy,
  CheckCircle2,
  AlertCircle,
  User,
  Settings,
  FileText,
  HelpCircle,
  ChevronRight,
  ChromeIcon as Google,
} from "lucide-react"
import { getFirebaseAuth, getFirebaseMessaging } from "@/lib/firebase"
import { FIREBASE_CONFIG } from "@/lib/firebase-config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [fcmToken, setFcmToken] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fcmError, setFcmError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Check if this is a new user (based on metadata)
        const creationTime = currentUser.metadata.creationTime
        const lastSignInTime = currentUser.metadata.lastSignInTime

        // If creation time and last sign in time are close, likely a new user
        if (creationTime && lastSignInTime) {
          const creationDate = new Date(creationTime)
          const lastSignInDate = new Date(lastSignInTime)
          const timeDiff = Math.abs(lastSignInDate.getTime() - creationDate.getTime())
          const isNew = timeDiff < 5 * 60 * 1000 // 5 minutes
          setIsNewUser(isNew)
        }

        initializeFCM()
      } else {
        router.push("/")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const initializeFCM = async () => {
    try {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        // Check notification permission
        if (Notification.permission) {
          setNotificationPermission(Notification.permission)
        }

        const messaging = getFirebaseMessaging()
        if (!messaging) {
          console.log("Firebase messaging is not available")
          setFcmError("Firebase messaging is not available. Make sure your Firebase configuration includes messaging.")
          return
        }

        // Request permission
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)

        if (permission !== "granted") {
          console.log("Notification permission not granted")
          setFcmError("Notification permission was not granted. Please enable notifications in your browser settings.")
          return
        }

        // Get FCM token
        try {
          if (!FIREBASE_CONFIG.vapidKey) {
            setFcmError("VAPID key is missing. You need to generate a VAPID key in Firebase Console.")
            return
          }

          const token = await getToken(messaging, {
            vapidKey: FIREBASE_CONFIG.vapidKey,
          })

          if (token) {
            setFcmToken(token)
            console.log("FCM Token:", token)

            // Show success toast
            toast({
              title: "Notifications Enabled",
              description: "You will now receive push notifications",
              variant: "default",
            })
          } else {
            console.log("No FCM token available")
            setFcmError("Could not get FCM token. Make sure your Firebase configuration is correct.")
          }
        } catch (tokenError: any) {
          console.error("Error getting FCM token:", tokenError)
          setFcmError(`Error getting FCM token: ${tokenError.message}`)
          toast({
            title: "FCM Token Error",
            description: "Could not get FCM token. VAPID key may be missing.",
            variant: "destructive",
          })
        }

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log("Message received:", payload)
          const { notification } = payload
          if (notification) {
            const newNotification = {
              id: Date.now().toString(),
              title: notification.title || "New Notification",
              body: notification.body || "You have a new notification",
              timestamp: new Date().toISOString(),
            }

            setNotifications((prev) => [newNotification, ...prev])

            toast({
              title: notification.title,
              description: notification.body,
            })
          }
        })
      }
    } catch (error: any) {
      console.error("Error initializing FCM:", error)
      setFcmError(`Error initializing FCM: ${error.message}`)
    }
  }

  const handleSignOut = () => {
    const auth = getFirebaseAuth()
    signOut(auth)
      .then(() => {
        router.push("/")
      })
      .catch((error) => {
        console.error("Sign out error:", error)
      })
  }

  const copyFcmToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken)
      setCopied(true)

      toast({
        title: "Token Copied",
        description: "FCM token copied to clipboard",
      })

      setTimeout(() => setCopied(false), 2000)
    }
  }

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === "granted") {
        // Re-initialize FCM
        initializeFCM()
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  // Show loading state
  if (loading) {
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
            Loading Dashboard...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-gradient-to-b from-background to-muted">
      <motion.div className="w-full max-w-6xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* Welcome Banner for New Users */}
        {isNewUser && (
          <motion.div
            className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Welcome to Your Dashboard! 🎉</h2>
                <p className="mb-4">Thank you for creating an account. Here's how to get started:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center">
                    <div className="bg-white/20 rounded-full p-1 mr-2">
                      <Bell className="h-4 w-4" />
                    </div>
                    <span>Enable notifications to stay updated</span>
                  </li>
                  <li className="flex items-center">
                    <div className="bg-white/20 rounded-full p-1 mr-2">
                      <User className="h-4 w-4" />
                    </div>
                    <span>Complete your profile information</span>
                  </li>
                  <li className="flex items-center">
                    <div className="bg-white/20 rounded-full p-1 mr-2">
                      <Settings className="h-4 w-4" />
                    </div>
                    <span>Explore the dashboard features</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                onClick={() => setIsNewUser(false)}
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}

        {/* Main Header Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 shadow-lg overflow-hidden mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => router.push("/setup-guide")}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Setup Guide
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <CardDescription>Welcome back, {user?.displayName || user?.email}</CardDescription>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start px-6 pt-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6 space-y-6">
                {/* Welcome Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    className="col-span-2"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Getting Started</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="bg-blue-100 rounded-full p-2 mr-4">
                              <Bell className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Enable Notifications</h3>
                              <p className="text-sm text-muted-foreground">
                                Stay updated with real-time notifications about important events.
                              </p>
                              {notificationPermission !== "granted" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2"
                                  onClick={requestNotificationPermission}
                                >
                                  Enable Now
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-purple-100 rounded-full p-2 mr-4">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Complete Your Profile</h3>
                              <p className="text-sm text-muted-foreground">
                                Add your details to personalize your experience.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => setActiveTab("profile")}
                              >
                                Update Profile
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-green-100 rounded-full p-2 mr-4">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Explore Documentation</h3>
                              <p className="text-sm text-muted-foreground">
                                Learn more about how to use all features of the application.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => router.push("/setup-guide")}
                              >
                                View Docs
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Your Profile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center text-center">
                          {user?.photoURL ? (
                            <div className="mb-4">
                              <motion.img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-20 h-20 rounded-full border-2 border-primary"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <span className="text-2xl font-bold text-primary">
                                {user?.email?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <h3 className="font-medium text-lg">{user?.displayName || "User"}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>

                          <div className="w-full pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Sign-in Method:</p>
                            <div className="flex items-center justify-center space-x-2">
                              {user?.providerData[0]?.providerId === "google.com" ? (
                                <>
                                  <div className="bg-red-100 p-1 rounded-full">
                                    <Google className="h-4 w-4 text-red-500" />
                                  </div>
                                  <span className="text-sm">Google</span>
                                </>
                              ) : (
                                <>
                                  <div className="bg-blue-100 p-1 rounded-full">
                                    <User className="h-4 w-4 text-blue-500" />
                                  </div>
                                  <span className="text-sm">Email/Password</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("profile")} className="w-full">
                          View Full Profile
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>

                {/* Google Authentication Info */}
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Google className="h-5 w-5 mr-2 text-red-500" />
                        Google Authentication
                      </CardTitle>
                      <CardDescription>
                        Learn how to set up and use Google Sign-In with your application
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                          <h3 className="font-medium mb-2">How Google Authentication Works</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-md text-center">
                              <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                                <span className="font-bold">1</span>
                              </div>
                              <p className="text-sm">User clicks "Sign in with Google" button</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-center">
                              <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                                <span className="font-bold">2</span>
                              </div>
                              <p className="text-sm">Google authentication popup appears</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-center">
                              <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                                <span className="font-bold">3</span>
                              </div>
                              <p className="text-sm">User is signed in after selecting their Google account</p>
                            </div>
                          </div>

                          <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
                            <p className="font-medium flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Important Requirements
                            </p>
                            <ul className="list-disc ml-6 mt-2 space-y-1">
                              <li>Your domain must be authorized in Firebase Console</li>
                              <li>Google Sign-In must be enabled as an authentication method</li>
                              <li>Popups must be allowed in your browser</li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/setup-guide")}
                            className="flex items-center"
                          >
                            View Setup Guide
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="profile" className="p-6 space-y-6">
                <motion.div
                  className="p-4 bg-muted rounded-lg"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <h3 className="text-lg font-medium mb-4">Your Profile</h3>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {user?.photoURL ? (
                      <div className="mr-4">
                        <motion.img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-24 h-24 rounded-full border-2 border-primary"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Display Name</p>
                        <p className="font-medium text-lg">{user?.displayName || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Created</p>
                        <p className="font-medium">
                          {user?.metadata?.creationTime
                            ? new Date(user.metadata.creationTime).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Authentication Method</p>
                        <div className="flex items-center mt-1">
                          {user?.providerData[0]?.providerId === "google.com" ? (
                            <>
                              <div className="bg-red-100 p-1 rounded-full">
                                <Google className="h-4 w-4 text-red-500" />
                              </div>
                              <span className="ml-2">Google</span>
                            </>
                          ) : (
                            <>
                              <div className="bg-blue-100 p-1 rounded-full">
                                <User className="h-4 w-4 text-blue-500" />
                              </div>
                              <span className="ml-2">Email/Password</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account preferences and settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications about account activity
                          </p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          Coming Soon
                        </Button>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <h4 className="font-medium">Change Password</h4>
                          <p className="text-sm text-muted-foreground">Update your account password</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          Coming Soon
                        </Button>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <h4 className="font-medium">Delete Account</h4>
                          <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" size="sm" disabled>
                          Coming Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="notifications" className="p-6 space-y-6">
                <motion.div
                  className="p-4 bg-muted rounded-lg"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-primary" />
                      Notification Status
                    </h3>

                    {notificationPermission !== "granted" && (
                      <Button
                        size="sm"
                        onClick={requestNotificationPermission}
                        className="relative overflow-hidden group"
                      >
                        <span>Enable Notifications</span>
                        <span className="absolute right-0 h-full w-12 -translate-x-12 bg-gradient-to-r from-transparent to-white/20 skew-x-[30deg] group-hover:animate-shimmer" />
                      </Button>
                    )}
                  </div>

                  <div className="mb-4">
                    {notificationPermission === "granted" ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        <span>Notifications are enabled</span>
                      </div>
                    ) : notificationPermission === "denied" ? (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>Notifications are blocked. Please enable them in your browser settings.</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>Notifications permission not granted</span>
                      </div>
                    )}
                  </div>

                  {fcmError && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">FCM Configuration Issue</p>
                          <p className="mt-1">{fcmError}</p>
                          <Link
                            href="/setup-guide"
                            className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                          >
                            View Setup Guide
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">FCM Token</h4>
                    {fcmToken ? (
                      <div className="relative">
                        <div className="text-xs break-all bg-background p-2 rounded border">{fcmToken}</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1 h-7 w-7 p-0"
                          onClick={copyFcmToken}
                        >
                          {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-amber-600">No FCM token available.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This may be because the VAPID key is missing or notification permissions were denied.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <NotificationList notifications={notifications} />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Notifications</CardTitle>
                      <CardDescription>Send a test notification to verify your setup</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        You can test push notifications by clicking the button below. This will send a test notification
                        to your browser.
                      </p>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => router.push("/test-notification")}
                          className="flex items-center"
                          disabled={!fcmToken || notificationPermission !== "granted"}
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Test Notifications
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>

            <CardFooter className="flex justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <Button variant="outline" onClick={() => router.push("/test-notification")} className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Test Notifications
              </Button>
              <Button onClick={handleSignOut} variant="destructive" className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
