import { Suspense } from "react"
import { ProposalsClient } from "./proposals-client"

export default function ProposalsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span>
      </div>
    }>
      <ProposalsClient isArchived={false} />
    </Suspense>
  )
}
