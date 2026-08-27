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
