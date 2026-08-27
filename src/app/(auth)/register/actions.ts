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
    return { error: "Failed to create account. Please try again." }
  }

  // Redirect outside try-catch
  redirect("/login?registered=true")
}
