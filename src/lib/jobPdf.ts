import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import pdfLogo from "@/assets/db-pdf-logo.png";

export interface JobPdfField {
  label: string;
  value: string;
}

export interface JobPdfSection {
  heading: string;
  fields?: JobPdfField[];
  list?: { text: string; done?: boolean }[];
  text?: string;
}

export interface JobPdfOptions {
  docTitle: string; // e.g. "Teknik Servis İş Formu"
  headerCode?: string; // tracking code
  statusLabel?: string;
  paymentBadge?: string; // Ödendi / Kısmi / Ödenmedi
  sections: JobPdfSection[];
  fileName?: string;
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const badgePalette = (label?: string) => {
  const normalized = (label || "").toLocaleLowerCase("tr-TR");
  if (normalized.includes("ödenmedi") || normalized.includes("bekliyor")) {
    return { background: "#fff1f2", border: "#fecdd3", foreground: "#be123c" };
  }
  if (normalized.includes("kısmi") || normalized.includes("ertelendi")) {
    return { background: "#fffbeb", border: "#fde68a", foreground: "#b45309" };
  }
  if (normalized.includes("ödendi") || normalized.includes("tamamlandı")) {
    return { background: "#ecfdf5", border: "#a7f3d0", foreground: "#047857" };
  }
  return { background: "#ecfeff", border: "#a5f3fc", foreground: "#0e7490" };
};

/**
 * Renders a single job to a compact, customer-facing A4 PDF (multi-page).
 * Never include material cost or net profit here — customer-facing document.
 */
export const exportJobPdf = async (opts: JobPdfOptions) => {
  const { docTitle, headerCode, statusLabel, paymentBadge, sections, fileName } = opts;
  const statusColors = badgePalette(statusLabel);
  const paymentColors = badgePalette(paymentBadge);

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:fixed;left:-10000px;top:0;width:900px;box-sizing:border-box;background:#f8fafc;color:#172033;padding:26px;font-family:Arial,Helvetica,sans-serif;";

  const sectionHtml = sections
    .filter((s) => (s.fields && s.fields.length) || (s.list && s.list.length) || s.text)
    .map((s, sectionIndex) => {
      const isPayment = s.heading.toLocaleLowerCase("tr-TR").includes("ödeme");
      const accentColors = ["#06b6d4", "#6366f1", "#ec4899", "#0f766e"];
      const accent = isPayment ? paymentColors.foreground : accentColors[sectionIndex % accentColors.length];
      let body = "";
      if (s.fields && s.fields.length) {
        body += `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 10px;">${s.fields
          .map(
            (f) => `<div style="box-sizing:border-box;border:1px solid ${isPayment ? paymentColors.border : "#e2e8f0"};background:${isPayment ? paymentColors.background : "#ffffff"};border-radius:6px;padding:7px 9px;min-height:43px;">
                      <div style="font-size:9px;line-height:1.2;color:#64748b;text-transform:uppercase;">${esc(f.label)}</div>
                      <div style="font-size:12px;line-height:1.25;font-weight:700;color:${isPayment ? paymentColors.foreground : "#172033"};margin-top:3px;overflow-wrap:anywhere;">${esc(f.value)}</div>
                    </div>`
          )
          .join("")}</div>`;
      }
      if (s.text) {
        body += `<div style="font-size:11px;line-height:1.45;white-space:pre-wrap;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;overflow-wrap:anywhere;">${esc(s.text)}</div>`;
      }
      if (s.list && s.list.length) {
        body += `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px 10px;">${s.list
          .map(
            (i) =>
              `<div style="display:flex;gap:7px;align-items:flex-start;background:${i.done ? "#ecfdf5" : "#ffffff"};border:1px solid ${i.done ? "#a7f3d0" : "#e2e8f0"};border-radius:6px;padding:6px 8px;min-height:28px;box-sizing:border-box;">
                 <div style="width:15px;height:15px;flex:0 0 15px;border:1px solid ${i.done ? "#10b981" : "#94a3b8"};border-radius:50%;background:${i.done ? "#10b981" : "transparent"};color:#ffffff;font-size:10px;line-height:14px;text-align:center;font-weight:700;">${i.done ? "✓" : ""}</div>
                 <div style="font-size:10.5px;line-height:1.35;flex:1;color:${i.done ? "#047857" : "#334155"};overflow-wrap:anywhere;">${esc(i.text)}</div>
               </div>`
          )
          .join("")}</div>`;
      }
      return `<div style="margin-bottom:10px;break-inside:avoid;">
                <div style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;color:#172033;margin-bottom:6px;">
                  <span style="display:block;width:4px;height:16px;border-radius:2px;background:${accent};"></span>${esc(
                  s.heading
                 )}</div>
                ${body}
              </div>`;
    })
    .join("");

  wrapper.innerHTML = `
    <div style="background:#111c3d;border-radius:9px;padding:16px 18px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;color:#ffffff;box-shadow:0 6px 18px rgba(15,23,42,.12);">
      <div style="display:flex;align-items:center;gap:13px;min-width:0;">
        <div style="width:54px;height:40px;border-radius:6px;background:#ffffff;display:flex;align-items:center;justify-content:center;padding:4px;box-sizing:border-box;">
          <img src="${pdfLogo}" alt="" style="display:block;max-width:46px;max-height:31px;object-fit:contain;" />
        </div>
        <div style="min-width:0;">
          <div style="font-size:18px;line-height:1.1;font-weight:700;">Dur Bilişim Teknolojileri</div>
          <div style="font-size:11px;color:#a5f3fc;font-weight:700;margin-top:4px;">${esc(docTitle)}</div>
        </div>
      </div>
      <div style="text-align:right;flex:0 0 auto;margin-left:16px;">
        ${headerCode ? `<div style="font-size:13px;color:#a5f3fc;font-weight:700;font-family:monospace;">${esc(headerCode)}</div>` : ""}
        <div style="display:flex;justify-content:flex-end;gap:5px;margin-top:6px;">
          ${statusLabel ? `<span style="display:inline-block;background:${statusColors.background};border:1px solid ${statusColors.border};color:${statusColors.foreground};border-radius:999px;padding:3px 8px;font-size:9px;font-weight:700;">${esc(statusLabel)}</span>` : ""}
          ${paymentBadge ? `<span style="display:inline-block;background:${paymentColors.background};border:1px solid ${paymentColors.border};color:${paymentColors.foreground};border-radius:999px;padding:3px 8px;font-size:9px;font-weight:700;">${esc(paymentBadge)}</span>` : ""}
        </div>
      </div>
    </div>
    <div style="background:#ffffff;border:1px solid #dbe5ef;border-radius:9px;padding:13px 14px;">
      ${sectionHtml}
    </div>
    <div style="margin-top:9px;display:flex;justify-content:space-between;border-top:1px solid #cbd5e1;padding:7px 2px 0;font-size:8.5px;color:#64748b;">
      <span>Dur Bilişim Teknolojileri · durbilisim.com</span>
      <span>${new Date().toLocaleString("tr-TR")} · Bilgilendirme belgesidir.</span>
    </div>
  `;

  document.body.appendChild(wrapper);
  try {
    const images = Array.from(wrapper.querySelectorAll("img"));
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    const canvas = await html2canvas(wrapper, { scale: 2, backgroundColor: "#ffffff", logging: false });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const safe = (fileName || docTitle).replace(/[^\wğüşıöçĞÜŞİÖÇ\s-]/g, "").replace(/\s+/g, "_");
    pdf.save(`${safe}_${new Date().toISOString().split("T")[0]}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
};
