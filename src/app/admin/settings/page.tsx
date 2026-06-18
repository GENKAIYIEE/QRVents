import { SettingsForm } from "@/components/admin/settings-form"
import { getSession } from "@/lib/auth"

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session) return null

  return (
        <div>
          <h1>Page</h1>
          <p>This page will be redesigned.</p>
        </div>
      );
}
