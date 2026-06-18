import { prisma } from "@/lib/prisma"
import RegisterForm from "@/components/auth/RegisterForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create your account — QRVents",
  description: "Register for QRVents Student Account",
}

export default async function RegisterPage() {
  const rawDepartments = await prisma.department.findMany({
    select: { id: true, name: true, code: true },
  })

  const EXACT_ORDER = ["BSIT", "BEED/BSED", "BSHM", "BSTM", "BSBA", "BSCRIM", "BSMARINE"]

  const departments = rawDepartments
    .filter(d => EXACT_ORDER.includes(d.code))
    .sort((a, b) => EXACT_ORDER.indexOf(a.code) - EXACT_ORDER.indexOf(b.code))

  return <RegisterForm departments={departments} />
}
