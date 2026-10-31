import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fileStamp, humanStamp } from "@/lib/fileStamp";

type Row = Record<string, any>;
export interface ReportData {
  service_jobs: Row[];
  camera_jobs: Row[];
  product_sales: Row[];
  computer_sales: Row[];
  expenses: Row[];
}

const tl = (n: number) => `${Math.round(n || 0).toLocaleString("tr-TR")} ₺`;
const d = (s?: string | null) => (s ? new Date(s).toLocaleDateString("tr-TR") : "-");
const esc = (s: unknown) => String(s ?? "-").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const done = (s: string) => ["completed", "tamamlandi"].includes(s);

const page = (title: string, body: string, n: number, total: number) => `
<div style="width:794px;height:1123px;box-sizing:border-box;padding:28px 34px;font-family:Arial,sans-serif;color:#1e293b;background:#fff;position:relative">
  <div style="background:#111c3d;color:#fff;border-radius:10px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center">
    <div><div style="font-size:18px;font-weight:700">Dur Bilişim Teknolojileri</div><div style="font-size:12px;opacity:.8">${title}</div></div>
    <div style="font-size:11px;opacity:.8">${new Date().toLocaleString("tr-TR")}</div>
  </div>
  <div style="margin-top:16px">${body}</div>
  <div style="position:absolute;bottom:18px;left:34px;right:34px;font-size:10px;color:#64748b;display:flex;justify-content:space-between;border-top:1px solid #e2e8f0;padding-top:6px">
    <span>durbilisim.com · Genel İş Raporu</span><span>Sayfa ${n} / ${total}</span>
  </div>
</div>`;

const card = (label: string, value: string, color: string) =>
  `<div style="flex:1;border-radius:8px;padding:10px;background:${color}15;border-left:4px solid ${color}"><div style="font-size:10px;color:#475569">${label}</div><div style="font-size:16px;font-weight:700;color:${color}">${value}</div></div>`;

const barChart = (title: string, labels: string[], series: { name: string; color: string; values: number[] }[]) => {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const cols = labels
    .map((l, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
      <div style="display:flex;align-items:flex-end;gap:1px;height:150px">${series
        .map((s) => `<div style="width:${Math.max(4, 36 / series.length)}px;height:${(s.values[i] / max) * 150}px;background:${s.color};border-radius:2px 2px 0 0"></div>`)
        .join("")}</div><div style="font-size:9px;margin-top:3px;color:#475569">${l}</div></div>`)
    .join("");
  const legend = series.map((s) => `<span style="margin-right:10px"><span style="display:inline-block;width:9px;height:9px;background:${s.color};border-radius:2px"></span> ${s.name}</span>`).join("");
  return `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-top:12px"><div style="font-weight:700;font-size:13px;margin-bottom:4px">${title}</div><div style="font-size:10px;margin-bottom:6px">${legend}</div><div style="display:flex;height:170px;gap:2px">${cols}</div></div>`;
};

const hbars = (title: string, items: { label: string; value: number; color: string }[], fmt = (n: number) => String(n)) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  return `<div style="flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:10px"><div style="font-weight:700;font-size:13px;margin-bottom:8px">${title}</div>${items
    .map((i) => `<div style="font-size:10px;margin-bottom:6px"><div style="display:flex;justify-content:space-between"><span>${esc(i.label)}</span><b>${fmt(i.value)}</b></div><div style="background:#f1f5f9;border-radius:4px;height:9px"><div style="width:${(i.value / max) * 100}%;height:9px;background:${i.color};border-radius:4px"></div></div></div>`)
    .join("") || '<div style="font-size:10px;color:#94a3b8">Kayıt yok</div>'}</div>`;
};

const table = (head: string[], rows: string[][]) =>
  `<table style="width:100%;border-collapse:collapse;font-size:9.5px"><thead><tr>${head.map((h) => `<th style="background:#1e3a8a;color:#fff;padding:5px;text-align:left">${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r, i) => `<tr style="background:${i % 2 ? "#f8fafc" : "#fff"}">${r.map((c) => `<td style="padding:4px 5px;border-bottom:1px solid #e2e8f0">${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;

const payBadge = (fee: number, paid: number) => {
  const [t, c] = paid >= fee && fee > 0 ? ["Ödendi", "#16a34a"] : paid > 0 ? ["Kısmi", "#ca8a04"] : fee > 0 ? ["Ödenmedi", "#dc2626"] : ["-", "#64748b"];
  return `<span style="color:${c};font-weight:700">${t}</span>`;
};

const chunk = <T,>(a: T[], n: number) => { const r: T[][] = []; for (let i = 0; i < a.length; i += n) r.push(a.slice(i, i + n)); return r.length ? r : [[]]; };

export async function exportReportPdf(data: ReportData, year = new Date().getFullYear()) {
  const { service_jobs: sj, camera_jobs: cj, product_sales: ps, computer_sales: cs, expenses: ex } = data;
  const inYear = (s?: string | null) => !!s && new Date(s).getFullYear() === year;
  const monthOf = (s: string) => new Date(s).getMonth();
  const monthly = (rows: Row[], dateKey: string, val: (r: Row) => number) => {
    const m = Array(12).fill(0);
    rows.forEach((r) => inYear(r[dateKey]) && (m[monthOf(r[dateKey])] += val(r)));
    return m;
  };
  const soldPcs = cs.filter((c) => c.status === "sold");
  const sRev = sj.reduce((s, j) => s + Number(j.paid_amount || 0), 0);
  const cRev = cj.reduce((s, j) => s + Number(j.paid_amount || 0), 0);
  const pRev = ps.reduce((s, p) => s + Number(p.sale_price || 0), 0);
  const pcRev = soldPcs.reduce((s, p) => s + Number(p.sale_price || 0), 0);
  const exTot = ex.reduce((s, e) => s + Number(e.amount || 0), 0);
  const debt = [...sj, ...cj].reduce((s, j) => s + Math.max(0, Number(j.fee || 0) - Number(j.paid_amount || 0)), 0);

  const count = (rows: Row[], key: string) => {
    const m: Record<string, number> = {};
    rows.forEach((r) => (m[r[key] || "Diğer"] = (m[r[key] || "Diğer"] || 0) + 1));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  };
  const palette = ["#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#475569"];

  const summary = `
    <div style="display:flex;gap:8px">${card("Teknik Servis Tahsilat", tl(sRev), "#2563eb")}${card("Kamera Tahsilat", tl(cRev), "#0891b2")}${card("Ürün Satış", tl(pRev), "#7c3aed")}</div>
    <div style="display:flex;gap:8px;margin-top:8px">${card("Bilgisayar Satış", tl(pcRev), "#16a34a")}${card("Toplam Gider", tl(exTot), "#dc2626")}${card("Bekleyen Alacak", tl(debt), "#ca8a04")}</div>
    <div style="display:flex;gap:8px;margin-top:8px">${card("Teknik Servis İşi", String(sj.length), "#2563eb")}${card("Kamera İşi", String(cj.length), "#0891b2")}${card("Satılan Bilgisayar", `${soldPcs.length} / ${cs.length}`, "#16a34a")}</div>
    ${barChart(`${year} Aylık Gelir`, MONTHS, [
      { name: "Servis", color: "#2563eb", values: monthly(sj, "created_at", (r) => Number(r.paid_amount || 0)) },
      { name: "Kamera", color: "#0891b2", values: monthly(cj, "created_at", (r) => Number(r.paid_amount || 0)) },
      { name: "Ürün", color: "#7c3aed", values: monthly(ps, "sale_date", (r) => Number(r.sale_price || 0)) },
      { name: "Bilgisayar", color: "#16a34a", values: monthly(soldPcs, "sale_date", (r) => Number(r.sale_price || 0)) },
      { name: "Gider", color: "#dc2626", values: monthly(ex, "expense_date", (r) => Number(r.amount || 0)) },
    ])}
    ${barChart(`${year} Aylık İş Sayısı`, MONTHS, [
      { name: "Teknik Servis", color: "#2563eb", values: monthly(sj, "created_at", () => 1) },
      { name: "Kamera", color: "#0891b2", values: monthly(cj, "created_at", () => 1) },
    ])}
    <div style="display:flex;gap:8px;margin-top:12px">
      ${hbars("Servis Türleri", count(sj, "service_type").map(([l, v], i) => ({ label: l, value: v, color: palette[i] })))}
      ${hbars("Kamera İş Tipleri", count(cj, "job_type").map(([l, v], i) => ({ label: l, value: v, color: palette[i] })))}
    </div>
    <div style="display:flex;gap:8px;margin-top:8px">
      ${hbars("Gider Kategorileri", Object.entries(ex.reduce((m: Record<string, number>, e) => ((m[e.category || "Diğer"] = (m[e.category || "Diğer"] || 0) + Number(e.amount || 0)), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([l, v], i) => ({ label: l, value: v, color: palette[(i + 3) % 8] })), tl)}
      ${hbars("İş Durumları", [
        { label: "Tamamlanan", value: [...sj, ...cj].filter((j) => done(j.status)).length, color: "#16a34a" },
        { label: "Devam Eden", value: [...sj, ...cj].filter((j) => !done(j.status)).length, color: "#ca8a04" },
      ])}
    </div>`;

  const bodies: { title: string; html: string }[] = [{ title: "Genel Özet ve Grafikler", html: summary }];
  const sortDesc = (a: Row[], k: string) => [...a].sort((x, y) => String(y[k] || "").localeCompare(String(x[k] || "")));
  const R = 34;
  chunk(sortDesc(sj, "created_at"), R).forEach((c, i, all) => bodies.push({ title: `Teknik Servis İşleri (${i + 1}/${all.length})`, html: table(["Tarih", "Kod", "Müşteri", "Cihaz / Tür", "Durum", "Ücret", "Ödenen", "Ödeme"], c.map((j) => [d(j.created_at), esc(j.tracking_code), esc(`${j.customer_name} ${j.customer_surname || ""}`), esc(`${j.device_name || ""} ${j.service_type}`), done(j.status) ? '<span style="color:#16a34a">Tamamlandı</span>' : '<span style="color:#ca8a04">Devam</span>', tl(j.fee), tl(j.paid_amount), payBadge(Number(j.fee || 0), Number(j.paid_amount || 0))])) }));
  chunk(sortDesc(cj, "created_at"), R).forEach((c, i, all) => bodies.push({ title: `Kamera İşleri (${i + 1}/${all.length})`, html: table(["Tarih", "Müşteri", "İş Tipi", "Kamera", "Durum", "Ücret", "Ödenen", "Ödeme"], c.map((j) => [d(j.created_at), esc(j.customer_name), esc(j.job_type), String(j.camera_count ?? "-"), done(j.status) ? '<span style="color:#16a34a">Tamamlandı</span>' : '<span style="color:#ca8a04">Devam</span>', tl(j.fee), tl(j.paid_amount), payBadge(Number(j.fee || 0), Number(j.paid_amount || 0))])) }));
  if (cs.length) chunk(sortDesc(cs, "purchase_date"), R).forEach((c, i, all) => bodies.push({ title: `Bilgisayar Satışları (${i + 1}/${all.length})`, html: table(["Alış", "Marka / Model", "İşlemci", "RAM", "Durum", "Satış Tarihi", "Satış", "Net Kâr"], c.map((p) => { const k = Number(p.sale_price || 0) - Number(p.purchase_price || 0); return [d(p.purchase_date), esc(`${p.brand} ${p.model}`), esc(p.cpu), esc(p.ram_gb), p.status === "sold" ? '<span style="color:#16a34a">Satıldı</span>' : '<span style="color:#2563eb">Stokta</span>', d(p.sale_date), p.status === "sold" ? tl(p.sale_price) : "-", p.status === "sold" ? `<b style="color:${k >= 0 ? "#16a34a" : "#dc2626"}">${tl(k)}</b>` : "-"]; })) }));
  if (ps.length) chunk(sortDesc(ps, "sale_date"), R).forEach((c, i, all) => bodies.push({ title: `Ürün Satışları (${i + 1}/${all.length})`, html: table(["Tarih", "Ürün", "Ödeme", "Tutar"], c.map((p) => [d(p.sale_date), esc(p.product_name), esc(p.payment_method), tl(p.sale_price)])) }));
  if (ex.length) chunk(sortDesc(ex, "expense_date"), R).forEach((c, i, all) => bodies.push({ title: `Giderler (${i + 1}/${all.length})`, html: table(["Tarih", "Açıklama", "Kategori", "Tutar"], c.map((e) => [d(e.expense_date), esc(e.description), esc(e.category), `<span style="color:#dc2626">${tl(e.amount)}</span>`])) }));

  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0";
  document.body.appendChild(host);
  try {
    for (let i = 0; i < bodies.length; i++) {
      host.innerHTML = page(bodies[i].title, bodies[i].html, i + 1, bodies.length);
      const canvas = await html2canvas(host.firstElementChild as HTMLElement, { scale: 1.6, backgroundColor: "#ffffff", logging: false });
      if (i) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.72), "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }
  } finally {
    host.remove();
  }
  pdf.save(`durbilisim_rapor_${fileStamp()}.pdf`);
}
