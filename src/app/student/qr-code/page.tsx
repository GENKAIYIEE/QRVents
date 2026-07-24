import { QrClient } from "./qr-client"
import { Suspense } from "react"

export default function StudentQrCodePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <span className="material-symbols-outlined animate-spin text-blue-500 text-4xl [font-variation-settings:'FILL'_1]">progress_activity</span>
      </div>
    }>
      <QrClient />
    </Suspense>
  )
}
