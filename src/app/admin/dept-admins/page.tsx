import { Suspense } from "react"
import { getDepartments } from "../events/actions" // Reuse getDepartments
import { DeptAdminsClient } from "./dept-admins-client"

export default async function DeptAdminsPage() {
  const departments = await getDepartments()
  return (
    <Suspense fallback={null}>
      <DeptAdminsClient departments={departments} />
    </Suspense>
  )
}
