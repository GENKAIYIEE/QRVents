import { SettingsForm } from "@/components/admin/settings-form"
import { getSession } from "@/lib/auth"

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session) return null

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-blue-500 text-sm">home</span>
          <span className="text-slate-400 text-xs font-semibold">/</span>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Settings</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">System Settings</h1>
      </div>

      <SettingsForm user={{
        id: session.userId,
        fullName: session.fullName,
        email: session.email,
        role: session.role
      }} />
    </div>
  )
}
