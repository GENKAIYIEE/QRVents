import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  return NextResponse.json({ message: "route ready" })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "DEPT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      date,
      startTime,
      endTime,
      venue,
      isMandatory,
      ...otherFields 
    } = body

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        venue,
        eventType: "DEPARTMENT",
        departmentId: session.departmentId,
        createdById: session.userId,
        isMandatory: isMandatory === true || isMandatory === "true" ? true : false,
      }
    })

    return NextResponse.json({ success: true, data: event })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
