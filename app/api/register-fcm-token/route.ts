import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json()

    // Here you would typically store the FCM token in your database
    // associated with the user ID
    console.log(`Registering FCM token for user ${userId}: ${token}`)

    // For demonstration purposes, we're just returning a success response
    // In a real application, you would save this token to your database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error registering FCM token:", error)
    return NextResponse.json({ error: "Failed to register FCM token" }, { status: 500 })
  }
}
