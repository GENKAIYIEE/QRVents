import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, createSession } from "@/lib/auth"

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      )
    }

    const passwordMatch = await comparePassword(
      password,
      user.passwordHash
    )

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      )
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      departmentId: user.departmentId,
      departmentCode: user.department?.code ?? null,
    })

    return NextResponse.json({
      success: true,
      role: user.role,
      fullName: user.fullName,
    })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
