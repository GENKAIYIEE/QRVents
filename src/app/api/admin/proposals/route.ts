import { NextResponse } from "next/server"
import { getProposals, reviewProposal } from "@/app/admin/proposals/actions"
import { getSession } from "@/lib/auth"
import { ProposalStatus } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const status = searchParams.get("status") || "ALL"
    const search = searchParams.get("search") || undefined
    const archived = searchParams.get("archived") === "true"

    const data = await getProposals(page, 10, status, search, archived)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, rejectionReason } = body
    
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }
    
    const proposal = await reviewProposal(id, status as ProposalStatus, rejectionReason)
    return NextResponse.json({ success: true, data: proposal })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
