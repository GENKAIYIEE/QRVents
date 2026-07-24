import { Suspense } from "react"
import { ProposalsClient } from "../proposals-client"

export default function ArchivedProposalsPage() {
  return (
    <Suspense fallback={null}>
      <ProposalsClient isArchived={true} />
    </Suspense>
  )
}
