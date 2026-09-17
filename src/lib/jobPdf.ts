import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

/**
 * Renders a single job to a clean A4 PDF (multi-page).
 * Never include material cost or net profit here — customer-facing document.
 */
export const exportJobPdf = async (opts: JobPdfOptions) => {
  const { docTitle, headerCode, statusLabel, paymentBadge, sections, fileName } = opts;

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:fixed;left:-10000px;top:0;width:900px;background:#ffffff;color:#111827;padding:40px;font-family:Arial,Helvetica,sans-serif;";

  const sectionHtml = sections
    .filter((s) => (s.fields && s.fields.length) || (s.list && s.list.length) || s.text)
    .map((s) => {
      let body = "";
      if (s.fields && s.fields.length) {
        body += `<div style="display:flex;flex-wrap:wrap;">${s.fields
          .map(
            (f) => `<div style="width:50%;box-sizing:border-box;padding:6px 10px 6px 0;">
                      <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.4px;">${esc(f.label)}</div>
                      <div style="font-size:13px;font-weight:600;margin-top:2px;">${esc(f.value)}</div>
                    </div>`
          )
          .join("")}</div>`;
      }
      if (s.text) {
        body += `<div style="font-size:12px;line-height:1.6;white-space:pre-wrap;padding:4px 0;">${esc(s.text)}</div>`;
      }
      if (s.list && s.list.length) {
        body += `<div>${s.list
          .map(
            (i) =>
              `<div style="display:flex;gap:8px;align-items:flex-start;padding:4px 0;border-bottom:1px solid #f3f4f6;">
                 <div style="width:16px;height:16px;border:1px solid ${i.done ? "#16a34a" : "#9ca3af"};border-radius:4px;color:#16a34a;font-size:11px;line-height:15px;text-align:center;font-weight:700;">${i.done ? "✓" : ""}</div>
                 <div style="font-size:12px;flex:1;">${esc(i.text)}</div>
               </div>`
          )
          .join("")}</div>`;
      }
      return `<div style="margin-bottom:18px;">
                <div style="font-size:12px;font-weight:700;color:#111827;background:#f3f4f6;padding:6px 10px;border-left:4px solid #111827;margin-bottom:8px;">${esc(
                  s.heading
                )}</div>
                ${body}
              </div>`;
    })
    .join("");

  wrapper.innerHTML = `
    <div style="border-bottom:2px solid #111827;padding-bottom:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        <div style="font-size:22px;font-weight:700;">Dur Bilişim Teknolojileri</div>
        <div style="font-size:15px;font-weight:600;margin-top:4px;">${esc(docTitle)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:3px;">Yazdırma: ${new Date().toLocaleString("tr-TR")}</div>
      </div>
      <div style="text-align:right;">
        ${headerCode ? `<div style="font-size:14px;font-weight:700;font-family:monospace;">${esc(headerCode)}</div>` : ""}
        ${statusLabel ? `<div style="font-size:11px;color:#374151;margin-top:4px;">Durum: <strong>${esc(statusLabel)}</strong></div>` : ""}
        ${paymentBadge ? `<div style="display:inline-block;margin-top:6px;border:1px solid #111827;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;">${esc(paymentBadge)}</div>` : ""}
      </div>
    </div>
    ${sectionHtml}
    <div style="margin-top:26px;border-top:1px solid #e5e7eb;padding-top:10px;font-size:10px;color:#6b7280;">
      Dur Bilişim Teknolojileri · durbilisim.com · Bu belge bilgilendirme amaçlıdır.
    </div>
  `;

  document.body.appendChild(wrapper);
  try {
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
