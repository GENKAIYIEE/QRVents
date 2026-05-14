"use server"

import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/register"

export type RegisterActionResult = {
  error?: string
  success?: boolean
}

export async function registerAction(data: RegisterFormValues): Promise<RegisterActionResult> {
  const result = registerSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { fullName, email, password, departmentId, yearLevel } = result.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "An account with this email already exists." }
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
        departmentId,
        qrCode: generatedQrCode,
        isActive: true,
      },
    })
  } catch (error) {
    return { error: "Failed to create account. Please try again." }
  }

  // Redirect outside try-catch
  redirect("/login?registered=true")
}
