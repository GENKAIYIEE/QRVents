import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "DEPT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pin = await prisma.scannerPin.findUnique({
      where: { userId: session.userId },
    })

    return NextResponse.json({ hasPin: !!pin })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "DEPT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, pin } = await request.json()

    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 })
    }

    if (action === "setup") {
      const pinHash = await bcrypt.hash(pin, 10)
      
      await prisma.scannerPin.upsert({
        where: { userId: session.userId },
        update: { pinHash },
        create: { userId: session.userId, pinHash },
      })

      return NextResponse.json({ success: true, message: "PIN set successfully" })
    }

    if (action === "validate") {
      const existingPin = await prisma.scannerPin.findUnique({
        where: { userId: session.userId },
      })

      if (!existingPin) {
        return NextResponse.json({ error: "No PIN configured" }, { status: 400 })
      }

      const isValid = await bcrypt.compare(pin, existingPin.pinHash)
      
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Scanner PIN error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
