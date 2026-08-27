import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface TablePdfOptions {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string }[];
  fileName?: string;
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Renders a data table to an A4 PDF (multi-page) using a temporary
 * off-screen DOM node so Turkish characters render correctly.
 */
export const exportTablePdf = async (opts: TablePdfOptions) => {
  const { title, subtitle, columns, rows, summary, fileName } = opts;

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:fixed;left:-10000px;top:0;width:1000px;background:#ffffff;color:#111827;padding:32px;font-family:Arial,Helvetica,sans-serif;";

  wrapper.innerHTML = `
    <div style="border-bottom:2px solid #111827;padding-bottom:10px;margin-bottom:16px;">
      <div style="font-size:22px;font-weight:700;">Dur Bilişim Teknolojileri</div>
      <div style="font-size:16px;font-weight:600;margin-top:4px;">${esc(title)}</div>
      ${subtitle ? `<div style="font-size:12px;color:#4b5563;margin-top:2px;">${esc(subtitle)}</div>` : ""}
      <div style="font-size:11px;color:#6b7280;margin-top:2px;">Tarih: ${new Date().toLocaleString("tr-TR")} · ${rows.length} kayıt</div>
    </div>
    ${
      summary && summary.length
        ? `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">${summary
            .map(
              (s) =>
                `<div style="border:1px solid #d1d5db;border-radius:6px;padding:8px 12px;min-width:150px;">
                   <div style="font-size:10px;color:#6b7280;">${esc(s.label)}</div>
                   <div style="font-size:14px;font-weight:700;">${esc(s.value)}</div>
                 </div>`
            )
            .join("")}</div>`
        : ""
    }
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <thead>
        <tr style="background:#111827;color:#ffffff;">
          ${columns.map((c) => `<th style="text-align:left;padding:7px 8px;">${esc(c)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${
          rows.length
            ? rows
                .map(
                  (r, i) =>
                    `<tr style="background:${i % 2 ? "#f3f4f6" : "#ffffff"};">${r
                      .map(
                        (cell) =>
                          `<td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top;">${esc(cell)}</td>`
                      )
                      .join("")}</tr>`
                )
                .join("")
            : `<tr><td colspan="${columns.length}" style="padding:16px;text-align:center;color:#6b7280;">Kayıt bulunamadı</td></tr>`
        }
      </tbody>
    </table>
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

    const safe = (fileName || title).replace(/[^\wğüşıöçĞÜŞİÖÇ\s-]/g, "").replace(/\s+/g, "_");
    pdf.save(`${safe}_${new Date().toISOString().split("T")[0]}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
};
