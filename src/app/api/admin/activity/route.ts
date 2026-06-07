import { NextResponse } from "next/server"
import { getActivityLogs } from "@/app/admin/activity/actions"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""

    const data = await getActivityLogs(page, 20, search)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
