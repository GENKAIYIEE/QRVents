import { NextResponse } from "next/server"
import { toggleDeptAdminStatus, resetDeptAdminPassword, deleteAdmin } from "@/app/admin/dept-admins/actions"
import { getSession } from "@/lib/auth"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    
    if (body.action === "toggle_status" && typeof body.isActive === "boolean") {
      const admin = await toggleDeptAdminStatus(id, body.isActive)
      return NextResponse.json({ success: true, data: admin })
    }
    
    if (body.action === "reset_password" && body.newPassword) {
      const admin = await resetDeptAdminPassword(id, body.newPassword)
      return NextResponse.json({ success: true, data: admin })
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
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
    await deleteAdmin(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
