export interface Peripheral {
  id: string;
  type: string; // monitor, klavye, mouse, kulaklik, hoparlor, kamera, yazici, diger
  name: string;
  purchase_price: number;
  sale_mode: "set" | "ayri"; // set: sete dahil, ayri: ayrı fiyatla satıldı
  sale_price: number;
}

export const PERIPHERAL_TYPES: Record<string, string> = {
  monitor: "Monitör",
  klavye: "Klavye",
  mouse: "Mouse",
  kulaklik: "Kulaklık",
  hoparlor: "Hoparlör",
  kamera: "Web Kamera",
  yazici: "Yazıcı",
  ups: "UPS",
  modem: "Modem",
  diger: "Diğer",
};

const n = (v: unknown) => Number(v) || 0;

/** Toplam satış = set fiyatı + ayrı satılan çevre birimleri */
export const computerRevenue = (c: any) =>
  n(c.sale_price) +
  ((c.peripherals || []) as Peripheral[])
    .filter((p) => p.sale_mode === "ayri")
    .reduce((s, p) => s + n(p.sale_price), 0);

/** Toplam maliyet = bilgisayar + tüm çevre birimleri alış */
export const computerCost = (c: any) =>
  n(c.purchase_price) +
  ((c.peripherals || []) as Peripheral[]).reduce((s, p) => s + n(p.purchase_price), 0);

export const computerProfit = (c: any) => computerRevenue(c) - computerCost(c);

/** Tahsilat hiçbir zaman negatif veya toplam satıştan fazla olamaz. */
export const computerPayment = (c: { sale_price?: number | null; peripherals?: Peripheral[]; paid_amount?: number | null }) => {
  const total = Math.max(0, computerRevenue(c));
  const paid = Math.max(0, Math.min(total, n(c.paid_amount)));
  const remaining = Math.max(0, total - paid);
  const status: "paid" | "partial" | "unpaid" = total > 0 && remaining === 0 ? "paid" : paid > 0 ? "partial" : "unpaid";
  return { total, paid, remaining, status };
};
