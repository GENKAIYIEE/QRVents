import { logoutAction } from "@/app/admin/actions"

export default function LogoutPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F4FF] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center gap-4 border border-blue-100">
        <h1 className="text-xl font-bold text-gray-800">Clear Active Session</h1>
        <p className="text-sm text-gray-600 text-center max-w-sm">
          You are currently logged in. To see the login page, you must clear your active session first.
        </p>
        <form action={logoutAction}>
          <button 
            type="submit" 
            className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            Logout & Return to Login
          </button>
        </form>
      </div>
    </div>
  )
}
