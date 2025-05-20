"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { Bell, BellOff } from "lucide-react"

interface Notification {
  id: string
  title: string
  body: string
  timestamp: string
}

interface NotificationListProps {
  notifications: Notification[]
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
}

export default function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>You'll see your notifications here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-full bg-muted p-3 mb-4">
                <BellOff className="h-6 w-6 text-muted-foreground" />
              </div>
            </motion.div>
            <h3 className="text-lg font-medium mb-1">No notifications yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              When you receive notifications, they will appear here. Make sure notifications are enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>Your recent notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
