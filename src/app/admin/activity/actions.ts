"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function getActivityLogs(page = 1, pageSize = 20, search = "") {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const whereClause: any = search ? {
    OR: [
      { action: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
      { userName: { contains: search, mode: "insensitive" } },
    ]
  } : {}

  const logs = await prisma.activityLog.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const total = await prisma.activityLog.count({ where: whereClause })

  return { logs, total, pages: Math.ceil(total / pageSize) }
}
