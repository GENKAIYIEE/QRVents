import { NextResponse } from "next/server"
import { restoreArchive } from "@/app/admin/proposals/actions"
import { getSession } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const proposal = await restoreArchive(resolvedParams.id)
    
    return NextResponse.json({ success: true, data: proposal })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
