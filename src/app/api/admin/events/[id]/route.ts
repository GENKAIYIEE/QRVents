import { NextResponse } from "next/server"
import { updateEvent, updateEventStatus, deleteEvent } from "@/app/admin/events/actions"
import { eventSchema } from "@/lib/validations/event"
import { getSession } from "@/lib/auth"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    
    // If body contains only status, we're just updating status
    if (body.status && Object.keys(body).length === 1) {
      const event = await updateEventStatus(id, body.status)
      return NextResponse.json({ success: true, data: event })
    }
    
    // Otherwise full update
    const validatedData = eventSchema.parse(body)
    const event = await updateEvent(id, validatedData)
    
    return NextResponse.json({ success: true, data: event })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation error", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const event = await deleteEvent(id)
    
    return NextResponse.json({ success: true, data: event })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
