import { SettingsForm } from "@/components/admin/settings-form"
import { getSession } from "@/lib/auth"
import { PenaltySettingsSection } from "@/components/admin/create-event-form"

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session) return null

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-blue-600 text-sm [font-variation-settings:'FILL'_1]">home</span>
          <span className="text-slate-300 text-xs font-bold">/</span>
          <span className="text-blue-600/80 text-[10px] font-extrabold uppercase tracking-widest">Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">System Settings</h1>
      </div>

      <SettingsForm user={{
        id: session.userId,
        fullName: session.fullName,
        email: session.email,
        role: session.role
      }} />

      <PenaltySettingsSection />
    </div>
  );
}
