import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendOtpEmail } from "@/lib/email"

// POST /api/auth/forgot-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    // ── Always return same shape to prevent email enumeration ─────────────────
    const genericResponse = NextResponse.json({
      success: true,
      message: "If an account exists for that email, a 6-digit OTP has been sent.",
    })

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (!user || !user.isActive) return genericResponse

    // ── Invalidate any existing unused tokens for this user ───────────────────
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    // ── Generate session token (returned to client to track the session) ───────
    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")

    // ── Generate 6-digit OTP ──────────────────────────────────────────────────
    const otp = String(Math.floor(100000 + crypto.randomInt(900000))).padStart(6, "0")
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

    // ── 10-minute expiry ──────────────────────────────────────────────────────
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: { tokenHash, otpHash, userId: user.id, expiresAt },
    })

    // ── Send OTP email ────────────────────────────────────────────────────────
    await sendOtpEmail(user.email, user.fullName, otp)

    // ── Return the raw session token to the client (never the OTP) ───────────
    return NextResponse.json({
      success: true,
      token: rawToken,
      message: "A 6-digit OTP has been sent to your email.",
    })
  } catch (error) {
    console.error("[forgot-password] Error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
