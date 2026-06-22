import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { randomUUID } from "crypto"
import { z } from "zod"

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  departmentId: z.string().min(1),
  yearLevel: z.enum(["1", "2", "3", "4"]),
  studentId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { fullName, email, password, departmentId, yearLevel, studentId } = result.data

    // Check for existing email
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      )
    }

    // Validate department exists
    const department = await prisma.department.findUnique({ where: { id: departmentId } })
    if (!department) {
      return NextResponse.json({ error: "Invalid department." }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const qrCode = randomUUID()

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: "STUDENT",
        yearLevel,
        studentId: studentId || null,
        departmentId,
        qrCode,
        isActive: true,
      },
      select: { id: true, fullName: true, email: true, role: true },
    })

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    )
  }
}
