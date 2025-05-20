"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function TestNotification() {
  const [fcmToken, setFcmToken] = useState("")
  const [title, setTitle] = useState("Test Notification")
  const [body, setBody] = useState("This is a test notification from the FCM app")
  const [loading, setLoading] = useState(false)

  const handleSendNotification = async () => {
    if (!fcmToken) {
      toast({
        title: "Error",
        description: "Please enter an FCM token",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: fcmToken,
          title,
          body,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification sent successfully",
        })
      } else {
        throw new Error(data.error || "Failed to send notification")
      }
    } catch (error: any) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test FCM Notification</CardTitle>
          <CardDescription>Send a test notification to a device using Firebase Cloud Messaging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fcm-token">FCM Token</Label>
            <Textarea
              id="fcm-token"
              placeholder="Paste the FCM token here"
              value={fcmToken}
              onChange={(e) => setFcmToken(e.target.value)}
              className="h-24"
            />
            <p className="text-xs text-muted-foreground">You can get this token from the dashboard after logging in</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Notification Body</Label>
            <Textarea
              id="body"
              placeholder="Enter notification message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="h-24"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSendNotification} disabled={loading || !fcmToken} className="w-full">
            {loading ? "Sending..." : "Send Test Notification"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
