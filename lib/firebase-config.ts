// Create a type for the Firebase config
export type FirebaseConfigType = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
  vapidKey?: string
}

// Your Firebase configuration from the provided details
export const FIREBASE_CONFIG: FirebaseConfigType = {
  apiKey: "AIzaSyCXAFIQ1PtYy67bEzGHjSpBKOnqIGV33V4",
  authDomain: "my-frontend-app-d472aa.firebaseapp.com",
  projectId: "my-frontend-app-d472aa",
  storageBucket: "my-frontend-app-d472aa.firebasestorage.app",
  messagingSenderId: "732962362887",
  appId: "1:732962362887:web:1ede0ad9c14dfe91fa3ca2",
  measurementId: "G-VMG97Y1D06",
  // VAPID key will be added when you generate it for web push notifications
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
}

// Function to get Firebase config
export const getFirebaseConfig = (): FirebaseConfigType => {
  // Try to get from localStorage first (for client-side persistence)
  if (typeof window !== "undefined") {
    try {
      const storedConfig = localStorage.getItem("firebaseConfig")
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig) as FirebaseConfigType
        // Verify it has the essential fields
        if (parsedConfig && parsedConfig.apiKey && parsedConfig.authDomain && parsedConfig.projectId) {
          console.log("Using Firebase config from localStorage")
          return parsedConfig
        }
      }
    } catch (error) {
      console.error("Error reading Firebase config from localStorage:", error)
    }
  }

  // Always return the hardcoded config since it's provided directly
  return FIREBASE_CONFIG
}

// Function to save Firebase config to localStorage (for future use if needed)
export const saveFirebaseConfig = (config: FirebaseConfigType): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("firebaseConfig", JSON.stringify(config))
  }
}

// Initialize localStorage with your config on first load
if (typeof window !== "undefined") {
  // Save the config to localStorage for persistence
  localStorage.setItem("firebaseConfig", JSON.stringify(FIREBASE_CONFIG))
}
