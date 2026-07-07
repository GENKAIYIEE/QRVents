import { NextResponse } from "next/server"
import { getEvents, createEvent } from "@/app/admin/events/actions"
import { eventSchema } from "@/lib/validations/event"
import { getSession } from "@/lib/auth"
import { EventStatus } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") as EventStatus | undefined

    const data = await getEvents(page, 10, search, status)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = eventSchema.parse(body)
    const event = await createEvent(validatedData)

    return NextResponse.json({ success: true, data: event })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}