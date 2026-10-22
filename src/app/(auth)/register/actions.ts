"use server"

import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { randomUUID } from "crypto"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/register"
import { verifyTurnstile, getClientIp } from "@/lib/captcha"

export type RegisterActionResult = {
  error?: string
  success?: boolean
}

export async function registerAction(
  data: RegisterFormValues,
  captchaToken: string | null
): Promise<RegisterActionResult> {
  const result = registerSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const captcha = await verifyTurnstile(captchaToken, getClientIp(await headers()))
  if (!captcha.ok) {
    return { error: captcha.error }
  }

  const { fullName, email, password, departmentId, yearLevel, section, studentId } = result.data

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return { error: "An account with this email already exists." }
    }

    if (studentId) {
      const existingStudentId = await prisma.user.findUnique({ where: { studentId } })
      if (existingStudentId) {
        return { error: "An account with this Student ID already exists. If this is your ID, please contact your administrator." }
      }
    }

    const hashedPassword = await hashPassword(password)
    const generatedQrCode = randomUUID()

    await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        role: "STUDENT",
        yearLevel,
        section,
        studentId: studentId ?? null,
        departmentId,
        qrCode: generatedQrCode,
        isActive: true,
      },
    })
  } catch (error) {
    // Two people submitting the same email/Student ID at once can slip past the checks above;
    // the unique index catches it, so tell the user why instead of a generic failure.
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : null
    if (code === "P2002") {
      return { error: "An account with this email or Student ID already exists." }
    }
    console.error("Register error:", error)
    return { error: "Failed to create account. Please try again." }
  }

  // Redirect to login page
  redirect("/login?registered=true")
}
