import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export interface ReportData {
  eventName: string;
  eventDate: Date;
  reportType: string;
  logs: any[];
}

export const generateEventReportPDF = async (data: ReportData) => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  
  try {
    const imgElement = document.createElement("img");
    imgElement.src = "/Pclu-Logo.png";
    await new Promise((resolve, reject) => {
      imgElement.onload = resolve;
      imgElement.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(imgElement, 0, 0);
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 12, 10, 24, 24); // x, y, width, height (Left side)
    }
  } catch (err) {
    console.error("Failed to load PCLU logo", err);
  }

  // ISO Logo
  try {
    const isoImgElement = document.createElement("img");
    isoImgElement.src = "/ISO-LOGO.png";
    await new Promise((resolve, reject) => {
      isoImgElement.onload = resolve;
      isoImgElement.onerror = reject;
    });

    const isoCanvas = document.createElement("canvas");
    isoCanvas.width = isoImgElement.width;
    isoCanvas.height = isoImgElement.height;
    const isoCtx = isoCanvas.getContext("2d");
    if (isoCtx) {
      isoCtx.drawImage(isoImgElement, 0, 0);
      const isoImgData = isoCanvas.toDataURL("image/png");
      // Calculate right-aligned position (pageWidth - right margin - width)
      doc.addImage(isoImgData, "PNG", pageWidth - 12 - 24, 10, 24, 24); // Right side
    }
  } catch (err) {
    console.error("Failed to load ISO logo", err);
  }

  // Header Text
  let currentY = 16;
  
  doc.setFontSize(13); // Reduced slightly to prevent overlap
  doc.setFont("times", "bold");
  doc.text("POLYTECHNIC COLLEGE OF LA UNION (PCLU), INC.", centerX, currentY, { align: "center" });
  
  currentY += 5;
  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.text("(Formerly PAMETS COLLEGES)", centerX, currentY, { align: "center" });
  
  currentY += 5;
  doc.setFont("times", "normal");
  doc.text("Don Pastor L. Panay Sr. Street, San Nicolas Sur, Agoo, La Union 2504", centerX, currentY, { align: "center" });
  
  currentY += 5;
  doc.text("Tel. No. (072) 2061761 Mobile No. 09171623141 / 09260953781", centerX, currentY, { align: "center" });
  
  currentY += 5;
  doc.text("Email: pclucollege@pclu.com.ph / https://www.facebook.com/PCLUOfficialpage", centerX, currentY, { align: "center" });
  
  currentY += 5;
  doc.setFont("times", "bolditalic");
  doc.text("Member: Philippine Association of Colleges & Universities", centerX, currentY, { align: "center" });
  
  // Line separator
  currentY += 6;
  doc.setLineWidth(0.5);
  doc.line(14, currentY, 196, currentY);

  // Event Details
  currentY += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Event: ${data.eventName}`, 14, currentY);
  
  currentY += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${format(new Date(data.eventDate), "MMMM d, yyyy")}`, 14, currentY);
  
  currentY += 5;
  doc.text(`Report Type: ${data.reportType}`, 14, currentY);
  
  currentY += 5;
  doc.text(`Generated on: ${format(new Date(), "MMM d, yyyy h:mm a")}`, 14, currentY);

  // Table Data
  currentY += 6;
  const tableColumn = ["Name", "Student ID", "Course", "Yr & Sec", "Time In", "Time Out", "Status"];
  const tableRows: any[] = [];

  data.logs.forEach(log => {
    const checkInTime = format(new Date(log.checkIn), "hh:mm a");
    const checkOutTime = log.checkOut ? format(new Date(log.checkOut), "hh:mm a") : "-";
    
    const course = log.user.department?.code || "Unassigned";
    const yearSec = `${log.user.yearLevel || "?"} - ${log.user.section || "?"}`;

    tableRows.push([
      log.user.fullName,
      log.user.studentId || "-",
      course,
      yearSec,
      checkInTime,
      checkOutTime,
      log.status
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: currentY,
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  const fileName = `attendance-${data.eventName.replace(/\s+/g, "-").toLowerCase()}-${data.reportType.replace(/\s+/g, "-").toLowerCase()}.pdf`;
  doc.save(fileName);
};

// ─── Penalties Report ────────────────────────────────────────────────────────

export interface PenaltiesReportData {
  penalties: any[];
  departmentFilter: string;
  eventFilter: string;
  statusFilter: string;
}

export const generatePenaltiesReportPDF = async (data: PenaltiesReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  const margin = 14;

  // ── PCLU Logo ──
  try {
    const img = document.createElement("img");
    img.src = "/Pclu-Logo.png";
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) { 
      ctx.drawImage(img, 0, 0); 
      doc.addImage(canvas.toDataURL("image/png"), "PNG", margin, 10, 24, 24); 
    }
  } catch { /* logo optional */ }

  // ── ISO Logo ──
  try {
    const img = document.createElement("img");
    img.src = "/ISO-LOGO.png";
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) { 
      ctx.drawImage(img, 0, 0); 
      const h = 24;
      const w = (img.width / img.height) * h;
      doc.addImage(canvas.toDataURL("image/png"), "PNG", pageWidth - margin - w, 10, w, h); 
    }
  } catch { /* logo optional */ }

  // ── Letterhead ──
  let y = 16;
  doc.setFontSize(13); doc.setFont("times", "bold");
  doc.text("POLYTECHNIC COLLEGE OF LA UNION (PCLU), INC.", centerX, y, { align: "center" });
  y += 5; doc.setFontSize(10); doc.setFont("times", "italic");
  doc.text("(Formerly PAMETS COLLEGES)", centerX, y, { align: "center" });
  y += 5; doc.setFont("times", "normal");
  doc.text("Don Pastor L. Panay Sr. Street, San Nicolas Sur, Agoo, La Union 2504", centerX, y, { align: "center" });
  y += 5; doc.text("Tel. No. (072) 2061761  Mobile No. 09171623141 / 09260953781", centerX, y, { align: "center" });
  y += 5; doc.text("Email: pclucollege@pclu.com.ph / https://www.facebook.com/PCLUOfficialpage", centerX, y, { align: "center" });
  y += 5; doc.setFont("times", "bolditalic");
  doc.text("Member: Philippine Association of Colleges & Universities", centerX, y, { align: "center" });
  y += 6; doc.setLineWidth(0.5); doc.line(margin, y, pageWidth - margin, y);

  // ── Report Title ──
  y += 9; doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text("ATTENDANCE PENALTIES REPORT", centerX, y, { align: "center" });

  // ── Filters / Meta ──
  y += 7; doc.setFontSize(9); doc.setFont("helvetica", "normal");
  const dept = data.departmentFilter === "ALL" ? "All Departments" : data.departmentFilter;
  const eventLabel = data.eventFilter === "ALL" ? "All Events" : data.eventFilter;
  const statusLabel = data.statusFilter === "ALL" ? "All Statuses" : data.statusFilter;
  doc.text(`Department: ${dept}   |   Event: ${eventLabel}   |   Status: ${statusLabel}`, margin, y);
  y += 5; doc.text(`Generated on: ${format(new Date(), "MMMM d, yyyy h:mm a")}`, margin, y);

  // ── Summary counts ──
  const total   = data.penalties.length;
  const pending = data.penalties.filter(p => p.status === "PENDING").length;
  const overdue = data.penalties.filter(p => p.status === "OVERDUE").length;
  const resolved = data.penalties.filter(p => p.status === "RESOLVED").length;
  const waived   = data.penalties.filter(p => p.status === "WAIVED").length;

  y += 7;
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(`Total: ${total}   Pending: ${pending}   Overdue: ${overdue}   Resolved: ${resolved}   Waived: ${waived}`, margin, y);

  // ── Separator ──
  y += 4; doc.setLineWidth(0.3); doc.line(margin, y, pageWidth - margin, y);

  // ── Table ──
  const columns = ["Student", "Dept", "Event", "Reason", "Type", "Amount/Hours", "Deadline", "Status"];
  const formatTitleCase = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace(/_/g, " ");
  };

  const rows = data.penalties.map(p => [
    p.student.fullName,
    p.student.department?.code ?? "—",
    p.event.title,
    p.reason ? formatTitleCase(p.reason) : "Absent",
    p.type ? formatTitleCase(p.type) : "Not chosen",
    p.type === "FEE"
      ? `PHP ${p.feeAmount}`
      : p.type === "COMMUNITY_SERVICE"
      ? `${p.serviceHours} hrs`
      : `PHP ${p.feeAmount} / ${p.serviceHours} hrs`,
    format(new Date(p.deadline), "MM/dd/yyyy"),
    formatTitleCase(p.status),
  ]);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: y + 2,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [26, 58, 143], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 44 }, // Student
      1: { cellWidth: 23 }, // Dept
      2: { cellWidth: 22 }, // Event
      3: { cellWidth: 16 }, // Reason
      4: { cellWidth: 18 }, // Type
      5: { cellWidth: 28 }, // Amount/Hours
      6: { cellWidth: 16 }, // Deadline
      7: { cellWidth: 15 }, // Status
    },
    didDrawPage: (hookData) => {
      // page footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${hookData.pageNumber} of ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 8,
        { align: "right" }
      );
    },
  });

  // ── Save ──
  const deptSlug = data.departmentFilter === "ALL" ? "all-depts" : data.departmentFilter.toLowerCase();
  const dateSlug = format(new Date(), "yyyyMMdd-HHmm");
  doc.save(`penalties-report-${deptSlug}-${dateSlug}.pdf`);
};
