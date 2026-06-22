import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Fetch fresh user data to keep session data current
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        studentId: true,
        yearLevel: true,
        qrCode: true,
        isActive: true,
        departmentId: true,
        department: {
          select: { id: true, code: true, name: true, color: true, lightBg: true },
        },
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
