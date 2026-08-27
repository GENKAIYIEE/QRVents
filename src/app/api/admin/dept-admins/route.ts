import { NextResponse } from "next/server"
import { getDeptAdmins, registerDeptAdmin } from "@/app/admin/dept-admins/actions"
import { getSession } from "@/lib/auth"
import { registerAdminSchema } from "@/lib/validations/dept-admin"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const departmentId = searchParams.get("departmentId") || "ALL"

    const data = await getDeptAdmins(page, 10, search, departmentId)
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
    const validatedData = registerAdminSchema.parse(body)
    const admin = await registerDeptAdmin(validatedData)
    
    return NextResponse.json({ success: true, data: admin })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation error", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
