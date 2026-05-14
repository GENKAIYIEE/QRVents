import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { COOKIE_NAME } from "@/lib/constants"

const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export async function getDeptLayoutData() {
  // Read the actual cookie the login action sets
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) redirect("/login")

  let payload: { userId?: string; role?: string; email?: string }
  try {
    const verified = await jwtVerify(token!, secretKey)
    payload = verified.payload as typeof payload
  } catch {
    redirect("/login")
  }

  if (payload!.role !== "DEPT_ADMIN") redirect("/login")

  // Fetch the full user record to get departmentId and fullName
  const user = await prisma.user.findUnique({
    where: { id: payload!.userId },
    select: { id: true, fullName: true, email: true, role: true, departmentId: true },
  })

  if (!user || !user.departmentId) redirect("/login")

  const department = await prisma.department.findUnique({
    where: { id: user.departmentId },
  })

  if (!department) redirect("/login")

  const session = {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  }

  return { session, department }
}

export async function getDashboardData() {
  // We can reuse getDeptLayoutData to avoid duplicating auth logic
  const { session, department } = await getDeptLayoutData()

  const now = new Date()

  const deptUsers = await prisma.user.findMany({
    where: { departmentId: department.id },
    select: { id: true },
  })
  const deptUserIds = deptUsers.map((u) => u.id)

  const [
    studentCount,
    upcomingEvents,
    pendingCount,
    approvedCount,
    rejectedCount,
    recentProposals,
    recentStudents,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", departmentId: department.id } }),
    prisma.event.findMany({
      where: {
        date: { gte: now },
        OR: [
          { eventType: "SCHOOL_WIDE" },
          { departmentId: department.id, status: "UPCOMING" },
        ],
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.eventProposal.count({ where: { departmentId: department.id, status: "PENDING" } }),
    prisma.eventProposal.count({ where: { departmentId: department.id, status: "APPROVED" } }),
    prisma.eventProposal.count({ where: { departmentId: department.id, status: "REJECTED" } }),
    prisma.eventProposal.findMany({
      where: { departmentId: department.id },
      orderBy: { submittedAt: "desc" },
      take: 3,
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", departmentId: department.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { fullName: true, yearLevel: true, email: true, createdAt: true },
    }),
    prisma.activityLog.findMany({
      where: { userId: { in: deptUserIds } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  return {
    session,
    department,
    deptName: department.name,
    studentCount,
    upcomingEvents,
    pendingCount,
    approvedCount,
    rejectedCount,
    recentProposals,
    recentStudents,
    recentActivity,
  }
}
