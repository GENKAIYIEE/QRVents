import type { Metadata } from "next"
import LoginForm from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "Access Portal — QRVents",
  description: "Secure login portal for QRVents",
}

export default function LoginPage() {
  return <LoginForm />
}
