import { NextResponse } from "next/server"
import { clearSession } from "@/lib/auth"

export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}

// Support GET for legacy/redirect logout
export async function GET() {
  await clearSession()
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!))
}
