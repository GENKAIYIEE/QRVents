import { QrClient } from "./qr-client"
import { Suspense } from "react"
import { QrPassSkeleton } from "@/components/student/qr-pass-skeleton"

export default function StudentQrCodePage() {
  return (
    <Suspense fallback={<QrPassSkeleton />}>
      <QrClient />
    </Suspense>
  )
}
