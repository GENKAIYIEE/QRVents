import type { Metadata } from "next"
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"

export const metadata: Metadata = {
  title: "Forgot Password — QRVents",
  description: "Reset your QRVents account password securely via email.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
