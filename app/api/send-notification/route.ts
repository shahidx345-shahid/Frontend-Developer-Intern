import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token, title, body } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 })
    }

    // Since we don't have the Firebase Admin SDK set up,
    // we'll return a mock response for demonstration purposes
    return NextResponse.json({
      success: true,
      message: `Notification would be sent to token: ${token}`,
      note: "This is a mock response. To send real notifications, you need to set up the Firebase Admin SDK.",
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
