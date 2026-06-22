import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPenaltySettings } from "@/lib/penalty"
import { prisma } from "@/lib/prisma"

// GET — fetch current settings
export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await getPenaltySettings()

    return NextResponse.json({ settings })

  } catch (error) {
    console.error("Get penalty settings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH — update settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const {
      defaultDeadlineDays,
      defaultFee,
      defaultServiceHours,
      overdueFeeIncrease,
      overdueHoursIncrease,
    } = body

    // Validate all values are positive numbers
    const values = [
      defaultDeadlineDays,
      defaultFee,
      defaultServiceHours,
      overdueFeeIncrease,
      overdueHoursIncrease,
    ]

    if (values.some((v) => typeof v !== "number" || v < 0)) {
      return NextResponse.json(
        { error: "All values must be positive numbers" },
        { status: 400 }
      )
    }

    const existing = await getPenaltySettings()

    const updated = await prisma.penaltySettings.update({
      where: { id: existing.id },
      data: {
        defaultDeadlineDays,
        defaultFee,
        defaultServiceHours,
        overdueFeeIncrease,
        overdueHoursIncrease,
      },
    })

    return NextResponse.json({ success: true, settings: updated })

  } catch (error) {
    console.error("Update penalty settings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
