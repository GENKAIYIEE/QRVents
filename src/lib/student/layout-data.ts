import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { COOKIE_NAME } from "@/lib/constants"

const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export async function getStudentLayoutData() {
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

  if (payload!.role !== "STUDENT") redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: payload!.userId },
    select: { id: true, fullName: true, email: true, role: true, departmentId: true, yearLevel: true, studentId: true },
  })

  if (!user) redirect("/login")

  let department = null
  if (user.departmentId) {
    department = await prisma.department.findUnique({
      where: { id: user.departmentId },
    })
  }

  const session = {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  }
  
  const studentUser = {
    id: user.id,
    yearLevel: user.yearLevel ? user.yearLevel.toString() : null,
    studentId: user.studentId
  }

  return { session, department, studentUser }
}
