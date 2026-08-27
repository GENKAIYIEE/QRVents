"use server"

import prisma from "@/lib/prisma"
import { getSession, hashPassword } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"
import { RegisterAdminFormValues } from "@/lib/validations/dept-admin"
import { revalidatePath } from "next/cache"

export async function getDeptAdmins(page = 1, pageSize = 10, search = "", departmentId = "ALL") {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const whereClause: any = {
    role: { in: ["DEPT_ADMIN", "SUPER_ADMIN"] },
    OR: [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ],
  }
  if (departmentId !== "ALL") {
    whereClause.departmentId = departmentId
  }

  const admins = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      department: { select: { code: true, name: true, color: true } },
    },
  })

  const total = await prisma.user.count({ where: whereClause })

  return { admins, total, pages: Math.ceil(total / pageSize) }
}

export async function registerDeptAdmin(data: RegisterAdminFormValues) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
  if (existingUser) {
    throw new Error("Email already in use")
  }

  const passwordHash = await hashPassword(data.password)

  const newAdmin = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: data.role || "DEPT_ADMIN",
      departmentId: data.role === "SUPER_ADMIN" ? null : data.departmentId,
      isActive: true,
    },
    include: {
      department: { select: { code: true, name: true } },
    },
  })

  await logActivity(session.userId, session.fullName, `Registered ${data.role === "SUPER_ADMIN" ? "Super" : "Dept"} Admin`, `Admin: ${newAdmin.fullName} ${newAdmin.department ? `(${newAdmin.department.code})` : ""}`)
  
  revalidatePath("/admin/dept-admins")
  revalidatePath("/admin/dashboard")
  return newAdmin
}

export async function toggleDeptAdminStatus(id: string, isActive: boolean) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const admin = await prisma.user.update({
    where: { id },
    data: { isActive },
  })

  const action = isActive ? "Reactivated" : "Deactivated"
  await logActivity(session.userId, session.fullName, `${action} Dept Admin`, `Admin: ${admin.fullName}`)
  
  revalidatePath("/admin/dept-admins")
  return admin
}

export async function resetDeptAdminPassword(id: string, newPasswordRaw: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const passwordHash = await hashPassword(newPasswordRaw)

  const admin = await prisma.user.update({
    where: { id },
    data: { passwordHash },
  })

  await logActivity(session.userId, session.fullName, "Reset Dept Admin Password", `Admin: ${admin.fullName}`)
  
  revalidatePath("/admin/dept-admins")
  return admin
}

export async function deleteAdmin(id: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  try {
    const admin = await prisma.user.delete({
      where: { id },
    })

    await logActivity(session.userId, session.fullName, "Deleted Admin", `Admin: ${admin.fullName}`)
    
    revalidatePath("/admin/dept-admins")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2003") {
      throw new Error("Cannot delete this admin because they have created events or proposals. Please keep them deactivated instead.")
    }
    throw error
  }
}
