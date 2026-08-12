import type { Metadata } from "next"
import ResetPasswordForm from "@/components/auth/ResetPasswordForm"

export const metadata: Metadata = {
  title: "Reset Password — QRVents",
  description: "Set a new password for your QRVents account.",
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
