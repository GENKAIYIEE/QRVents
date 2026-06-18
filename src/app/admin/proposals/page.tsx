import { Suspense } from "react"
import { ProposalsClient } from "./proposals-client"

export default function ProposalsPage() {
  return (
    <Suspense fallback={null}>
      <ProposalsClient />
    </Suspense>
  )
}
