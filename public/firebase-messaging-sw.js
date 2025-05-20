// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

// Initialize the Firebase app in the service worker
// We'll use a try-catch block to handle potential errors
try {
  // Your Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCXAFIQ1PtYy67bEzGHjSpBKOnqIGV33V4",
    authDomain: "my-frontend-app-d472aa.firebaseapp.com",
    projectId: "my-frontend-app-d472aa",
    storageBucket: "my-frontend-app-d472aa.firebasestorage.app",
    messagingSenderId: "732962362887",
    appId: "1:732962362887:web:1ede0ad9c14dfe91fa3ca2",
    measurementId: "G-VMG97Y1D06",
  }

  self.firebase.initializeApp(firebaseConfig)

  // Retrieve an instance of Firebase Messaging so that it can handle background
  // messages.
  const messaging = self.firebase.messaging()

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload)

    const notificationTitle = payload.notification?.title || "New Notification"
    const notificationOptions = {
      body: payload.notification?.body || "You have a new notification",
      icon: "/icon-192x192.png",
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
  })
} catch (error) {
  console.error("[firebase-messaging-sw.js] Error initializing Firebase:", error)
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click received.")

  event.notification.close()

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus()
        }
        if (clients.openWindow) return clients.openWindow("/")
      }),
  )
})
