import { initializeApp, getApps } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getMessaging } from "firebase/messaging"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getFirebaseConfig } from "./firebase-config"

// Initialize Firebase with a direct client-side approach
export const initializeFirebase = () => {
  const apps = getApps()
  if (apps.length === 0) {
    try {
      // Use the direct configuration object
      const firebaseConfig = getFirebaseConfig()

      // Ensure required fields exist before initializing
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain) {
        throw new Error("Firebase configuration is missing required fields")
      }

      // Initialize the app with the configuration
      const app = initializeApp(firebaseConfig)
      console.log("Firebase initialized successfully with client-side config")

      // Set up auth persistence
      const auth = getAuth(app)
      setPersistence(auth, browserLocalPersistence)
        .then(() => console.log("Auth persistence set to LOCAL"))
        .catch((error) => console.error("Error setting auth persistence:", error))

      // Initialize analytics if in browser environment
      if (typeof window !== "undefined") {
        initializeAnalytics(app)
      }

      return app
    } catch (error) {
      console.error("Error initializing Firebase:", error)
      throw error
    }
  } else {
    return apps[0]
  }
}

// Initialize Firebase Analytics
export const initializeAnalytics = async (app: any) => {
  try {
    // Check if analytics is supported in this environment
    const analyticsSupported = await isSupported()

    if (analyticsSupported) {
      const analytics = getAnalytics(app)
      console.log("Firebase Analytics initialized successfully")
      return analytics
    } else {
      console.log("Firebase Analytics is not supported in this environment")
      return null
    }
  } catch (error) {
    console.error("Error initializing Firebase Analytics:", error)
    return null
  }
}

// Get Firebase Auth instance
export const getFirebaseAuth = () => {
  try {
    const app = initializeFirebase()
    return getAuth(app)
  } catch (error) {
    console.error("Error getting Firebase auth:", error)
    throw new Error("Firebase authentication is not available. Please check your configuration.")
  }
}

// Get Firebase Messaging instance (for FCM)
export const getFirebaseMessaging = () => {
  if (typeof window !== "undefined") {
    try {
      const app = initializeFirebase()
      return getMessaging(app)
    } catch (error) {
      console.error("Error getting Firebase messaging:", error)
      return null
    }
  }
  return null
}

// Get Firebase Analytics instance
export const getFirebaseAnalytics = async () => {
  if (typeof window !== "undefined") {
    try {
      const app = initializeFirebase()
      return await initializeAnalytics(app)
    } catch (error) {
      console.error("Error getting Firebase analytics:", error)
      return null
    }
  }
  return null
}
