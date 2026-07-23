"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"
import { revalidatePath } from "next/cache"

export async function getStudents(page = 1, pageSize = 10, search = "", departmentId = "ALL", yearLevel = "ALL", section = "ALL") {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const whereClause: any = {
    role: "STUDENT",
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { studentId: { contains: search, mode: "insensitive" } },
      ]
    })
  }

  if (departmentId && departmentId !== "ALL") {
    whereClause.departmentId = departmentId
  }
  
  if (yearLevel && yearLevel !== "ALL") {
    whereClause.yearLevel = yearLevel
  }

  if (section && section !== "ALL") {
    whereClause.section = section
  }

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        department: { select: { code: true, name: true, color: true } }
      }
    }),
    prisma.user.count({ where: whereClause })
  ])

  return { students, total, pages: Math.ceil(total / pageSize) }
}

export async function deleteStudent(id: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const student = await prisma.user.findUnique({
    where: { id },
    include: { department: true }
  })

  if (!student) {
    throw new Error("Student not found")
  }

  // Hard delete: cascade delete manually because Prisma schema doesn't have onDelete: Cascade for all
  await prisma.$transaction(async (tx) => {
    // Delete attendance logs
    await tx.attendanceLog.deleteMany({ where: { userId: id } })
    
    // Delete penalties
    await tx.penalty.deleteMany({ where: { studentId: id } })
    
    // Delete notifications
    await tx.notification.deleteMany({ where: { userId: id } })
    
    // Delete proposals (just in case they have any)
    await tx.eventProposal.deleteMany({ where: { submittedById: id } })
    
    // Clear resolvedById on penalties if they resolved any
    await tx.penalty.updateMany({ where: { resolvedById: id }, data: { resolvedById: null } })
    
    // Finally delete the user
    await tx.user.delete({ where: { id } })
  })

  await logActivity(
    session.userId, 
    session.fullName, 
    "Deleted Student Account", 
    `Student: ${student.fullName} (${student.studentId || 'No ID'})`
  )
  
  revalidatePath("/admin/students")
  revalidatePath("/admin/dashboard") // Stats might change
  
  return student
}

export async function getDepartments() {
  return await prisma.department.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { code: 'asc' }
  })
}
