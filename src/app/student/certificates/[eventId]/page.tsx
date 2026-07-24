import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import Script from "next/script"

export default async function CertificatePage({ params }: { params: Promise<{ eventId: string }> }) {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    redirect("/login")
  }

  const { eventId } = await params

  // Verify attendance and get event details
  const attendanceLog = await prisma.attendanceLog.findUnique({
    where: {
      userId_eventId: {
        userId: session.userId,
        eventId: eventId
      }
    },
    include: {
      event: true,
      user: true
    }
  })

  if (!attendanceLog || attendanceLog.event.status !== "COMPLETED") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Certificate Unavailable</h1>
          <p className="text-slate-500 text-sm">
            You must have attended and completed this event to generate a certificate.
          </p>
        </div>
      </div>
    )
  }

  const { event, user } = attendanceLog

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Action Bar (Hidden when printing) */}
      <div className="w-full max-w-[1000px] mb-6 flex justify-between items-center print:hidden bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-[28px] [font-variation-settings:'FILL'_1]">workspace_premium</span>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">E-Certificate Ready</h1>
            <p className="text-xs text-slate-500">Preview your certificate below</p>
          </div>
        </div>
        <button 
          id="print-btn"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Download PDF
        </button>
      </div>

      {/* Responsive Wrapper for Certificate */}
      <div className="w-full max-w-full overflow-x-auto pb-8 print:p-0 print:overflow-visible rounded-xl custom-scrollbar">
        <div className="min-w-[1056px] flex justify-center print:block">
          
          {/* Certificate Paper */}
          <div className="bg-gradient-to-br from-white via-[#faf9f6] to-[#f3f0e6] w-[1056px] h-[746.8px] relative shadow-2xl print:shadow-none overflow-hidden print:w-full print:h-full print:max-w-none print:m-0 print:border-none rounded-sm mx-auto print:absolute print:inset-0">


        {/* Certificate ID */}
        <div className="absolute bottom-6 left-6 text-[9px] text-slate-400 font-mono tracking-widest z-20">
          CERT NO: {attendanceLog.id.split('-')[0].toUpperCase()}-{new Date(event.date).getFullYear()}
        </div>
        
        {/* Intricate Borders */}
        <div className="absolute inset-0 border-[12px] border-[#0F1E45] pointer-events-none z-10 m-6 print:m-4" />
        <div className="absolute inset-0 border-[2px] border-[#0F1E45] pointer-events-none z-10 m-10 print:m-8" />
        <div className="absolute inset-0 border-[4px] border-[#D4AF37] pointer-events-none z-10 m-11 print:m-9" />
        <div className="absolute inset-0 border-[1px] border-[#0F1E45] pointer-events-none z-10 m-14 print:m-12" />
        
        {/* Corner Ornaments */}
        <div className="absolute top-12 left-12 w-8 h-8 border-t-4 border-l-4 border-[#0F1E45] z-10 pointer-events-none" />
        <div className="absolute top-12 right-12 w-8 h-8 border-t-4 border-r-4 border-[#0F1E45] z-10 pointer-events-none" />
        <div className="absolute bottom-12 left-12 w-8 h-8 border-b-4 border-l-4 border-[#0F1E45] z-10 pointer-events-none" />
        <div className="absolute bottom-12 right-12 w-8 h-8 border-b-4 border-r-4 border-[#0F1E45] z-10 pointer-events-none" />

        {/* Subtle Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="material-symbols-outlined" style={{ fontSize: '600px' }}>workspace_premium</span>
        </div>

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center p-20 text-center">
          
          <div className="flex items-center gap-3 mb-6">
             <div className="w-12 h-12 bg-[#0F1E45] rounded-lg flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-[24px]">qr_code_scanner</span>
             </div>
             <h2 className="text-xl font-bold text-[#0F1E45] tracking-[0.2em] uppercase">QRVents</h2>
          </div>

          <h1 className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-sm mb-6">Certificate of Attendance</h1>
          
          <h2 className="text-4xl text-slate-800 mb-6 max-w-3xl leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
            This is to proudly certify that
          </h2>

          <div className="w-full max-w-3xl mb-6">
            <h1 className="text-6xl font-bold text-[#0F1E45] pb-2 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
              {user.fullName}
            </h1>
            <div className="w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2"></div>
          </div>

          <p className="text-lg text-slate-600 mb-2 max-w-2xl leading-relaxed font-light">
            has successfully attended and participated in the event titled
          </p>

          <h3 className="text-3xl font-bold text-[#0F1E45] mb-4 max-w-3xl leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            "{event.title}"
          </h3>

          <p className="text-[15px] text-slate-600 mb-4 max-w-2xl leading-relaxed font-light">
            This certification is proudly awarded in recognition of their active engagement, dedication, and commitment to continuous learning and excellence.
          </p>

          <div className="flex w-full max-w-4xl justify-between items-end mt-auto pt-4 pb-2 px-12 z-20">
            <div className="text-center w-64">
              <div className="font-bold text-slate-800 text-lg border-b border-[#0F1E45] pb-2 px-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {format(new Date(event.date), "MMMM d, yyyy")}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-semibold">Date of Issuance</div>
            </div>
            
            <div className="text-center w-64">
              <div className="border-b border-[#0F1E45] pb-1 px-4 min-h-[40px]">
                {/* Blank signature line */}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-semibold">System Administrator</div>
            </div>
          </div>

        </div>
        </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Great+Vibes&display=swap');
        
        @media print {
          @page { size: landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
      
      <Script id="print-script" strategy="afterInteractive">
        {`
          document.getElementById('print-btn').addEventListener('click', function() {
            window.print();
          });
        `}
      </Script>
    </div>
  )
}
