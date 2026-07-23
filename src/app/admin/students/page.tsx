import { Metadata } from "next"
import { StudentsClient } from "./students-client"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Students | QRVents Admin",
  description: "Manage registered students",
}

export default async function StudentsPage() {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login")
  }

  return <StudentsClient />
}
