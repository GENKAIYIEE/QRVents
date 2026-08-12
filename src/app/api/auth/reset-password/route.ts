import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import * as z from "zod"

const resetSchema = z.object({
  token: z.string().min(1, "Token is required."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
})

// POST /api/auth/reset-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = resetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      )
    }

    const { token, newPassword } = parsed.data
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid session. Please start over." },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        { error: "This session has already been used. Please request a new OTP." },
        { status: 400 }
      )
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: "Your session has expired. Please request a new OTP." },
        { status: 400 }
      )
    }

    // ── Must have passed OTP verification first ───────────────────────────────
    if (!resetToken.otpVerified) {
      return NextResponse.json(
        { error: "OTP has not been verified. Please complete the verification step." },
        { status: 403 }
      )
    }

    // ── Atomically update password + mark token as used ───────────────────────
    const newHash = await hashPassword(newPassword)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordResetToken.update({
        where: { tokenHash },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ success: true, message: "Password has been reset successfully." })
  } catch (error) {
    console.error("[reset-password] Error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
