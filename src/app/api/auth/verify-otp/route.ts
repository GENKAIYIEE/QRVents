import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

// POST /api/auth/verify-otp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, otp } = body

    if (!token || !otp) {
      return NextResponse.json({ error: "Token and OTP are required." }, { status: 400 })
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "OTP must be a 6-digit number." }, { status: 400 })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    })

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid session. Please start over." }, { status: 400 })
    }

    if (resetToken.used) {
      return NextResponse.json(
        { error: "This session has already been used. Please request a new OTP." },
        { status: 400 }
      )
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: "Your OTP has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // ── Validate OTP ──────────────────────────────────────────────────────────
    if (otpHash !== resetToken.otpHash) {
      return NextResponse.json(
        { error: "Invalid OTP. Please check your email and try again." },
        { status: 400 }
      )
    }

    // ── Mark OTP as verified ──────────────────────────────────────────────────
    await prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { otpVerified: true },
    })

    return NextResponse.json({ success: true, message: "OTP verified successfully." })
  } catch (error) {
    console.error("[verify-otp] Error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
