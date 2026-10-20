import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Pencil, Monitor, CheckCircle2, Undo2, Printer,
  Cpu, MemoryStick, HardDrive, CalendarDays, TrendingUp, Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { PaymentMethod } from "@/types/serviceJob";
import { exportJobPdf } from "@/lib/jobPdf";

interface ComputerSale {
  id: string;
  brand: string;
  model: string;
  serial_number: string;
  cpu: string;
  gpu: string;
  ram_gb: string;
  storage: string;
  os: string;
  condition: string;
  purchase_date: string;
  purchase_price: number;
  supplier: string;
  warranty_months: number;
  accessories: string;
  notes: string;
  status: string; // stokta | satildi
  sale_price: number | null;
  sale_date: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_address: string;
  payment_method: string;
  installments: number;
  created_at: string;
}

const emptyForm = {
  brand: "",
  model: "",
  serial_number: "",
  cpu: "",
  gpu: "",
  ram_gb: "",
  storage: "",
  os: "",
  condition: "yeni",
  purchase_date: new Date().toISOString().slice(0, 10),
  purchase_price: "",
  supplier: "",
  warranty_months: "24",
  accessories: "",
  notes: "",
};

const emptySaleForm = {
  sale_price: "",
  sale_date: new Date().toISOString().slice(0, 10),
  buyer_name: "",
  buyer_phone: "",
  buyer_address: "",
  payment_method: "nakit" as PaymentMethod,
  installments: 1,
};

const CONDITION_LABELS: Record<string, string> = {
  yeni: "Yeni",
  ikinci_el: "2. El",
  yenilenmis: "Yenilenmiş",
};

const ComputerSalesManager = () => {
  const [computers, setComputers] = useState<ComputerSale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saleForm, setSaleForm] = useState(emptySaleForm);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("computer_sales")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setComputers(data as ComputerSale[]);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.brand.trim() || !form.model.trim()) {
      toast({ title: "Marka ve model zorunludur", variant: "destructive" });
      return;
    }
    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      serial_number: form.serial_number.trim(),
      cpu: form.cpu.trim(),
      gpu: form.gpu.trim(),
      ram_gb: form.ram_gb.trim(),
      storage: form.storage.trim(),
      os: form.os.trim(),
      condition: form.condition,
      purchase_date: form.purchase_date || new Date().toISOString(),
      purchase_price: parseFloat(form.purchase_price) || 0,
      supplier: form.supplier.trim(),
      warranty_months: parseInt(form.warranty_months) || 0,
      accessories: form.accessories.trim(),
      notes: form.notes.trim(),
    };
    if (editingId) {
      await (supabase as any).from("computer_sales").update(payload).eq("id", editingId);
      toast({ title: "Bilgisayar güncellendi!" });
    } else {
      await (supabase as any).from("computer_sales").insert({ ...payload, status: "stokta" });
      toast({ title: "Bilgisayar kaydedildi!" });
    }
    resetForm();
    await fetchData();
  };

  const handleEdit = (c: ComputerSale) => {
    setEditingId(c.id);
    setForm({
      brand: c.brand,
      model: c.model,
      serial_number: c.serial_number || "",
      cpu: c.cpu || "",
      gpu: c.gpu || "",
      ram_gb: c.ram_gb || "",
      storage: c.storage || "",
      os: c.os || "",
      condition: c.condition || "yeni",
      purchase_date: c.purchase_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      purchase_price: c.purchase_price?.toString() || "",
      supplier: c.supplier || "",
      warranty_months: c.warranty_months?.toString() || "24",
      accessories: c.accessories || "",
      notes: c.notes || "",
    });
    setShowForm(true);
    setSellingId(null);
  };

  const handleMarkSold = async (id: string) => {
    if (!saleForm.sale_price || parseFloat(saleForm.sale_price) <= 0) {
      toast({ title: "Satış fiyatı girin", variant: "destructive" });
      return;
    }
    await (supabase as any).from("computer_sales").update({
      status: "satildi",
      sale_price: parseFloat(saleForm.sale_price),
      sale_date: saleForm.sale_date || new Date().toISOString(),
      buyer_name: saleForm.buyer_name.trim(),
      buyer_phone: saleForm.buyer_phone.trim(),
      buyer_address: saleForm.buyer_address.trim(),
      payment_method: saleForm.payment_method,
      installments: saleForm.installments,
    }).eq("id", id);
    toast({ title: "Satış olarak işaretlendi!" });
    setSellingId(null);
    setSaleForm(emptySaleForm);
    await fetchData();
  };

  const handleUndoSale = async (id: string) => {
    await (supabase as any).from("computer_sales").update({
      status: "stokta",
      sale_price: null,
      sale_date: null,
      buyer_name: "",
      buyer_phone: "",
      buyer_address: "",
    }).eq("id", id);
    toast({ title: "Satış geri alındı, stokta" });
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("computer_sales").delete().eq("id", id);
    toast({ title: "Kayıt silindi" });
    await fetchData();
  };

  const handlePrint = (c: ComputerSale) => {
    const sold = c.status === "satildi";
    const paymentLabel =
      c.payment_method === "kart" ? "Kredi Kartı" :
      c.payment_method === "taksit" ? `Taksit (${c.installments} ay)` : "Nakit";
    exportJobPdf({
      docTitle: "Bilgisayar Satış Formu",
      headerCode: c.serial_number || undefined,
      statusLabel: sold ? "Satıldı" : "Stokta",
      paymentBadge: sold ? "Ödendi" : undefined,
      sections: [
        {
          heading: "Bilgisayar Bilgileri",
          fields: [
            { label: "Marka", value: c.brand },
            { label: "Model", value: c.model },
            { label: "Seri No", value: c.serial_number || "—" },
            { label: "Durum", value: CONDITION_LABELS[c.condition] || c.condition },
            { label: "Garanti", value: c.warranty_months ? `${c.warranty_months} ay` : "—" },
            { label: "İşletim Sistemi", value: c.os || "—" },
          ],
        },
        {
          heading: "Teknik Özellikler",
          fields: [
            { label: "İşlemci", value: c.cpu || "—" },
            { label: "Ekran Kartı", value: c.gpu || "—" },
            { label: "RAM", value: c.ram_gb || "—" },
            { label: "Depolama", value: c.storage || "—" },
          ],
        },
        ...(c.accessories
          ? [{ heading: "Aksesuarlar", text: c.accessories }]
          : []),
        ...(sold
          ? [{
              heading: "Satış ve Ödeme Bilgileri",
              fields: [
                { label: "Satış Fiyatı", value: `${(c.sale_price || 0).toLocaleString("tr-TR")}₺` },
                { label: "Satış Tarihi", value: c.sale_date ? new Date(c.sale_date).toLocaleDateString("tr-TR") : "—" },
                { label: "Ödeme Yöntemi", value: paymentLabel },
                { label: "Ödeme Durumu", value: "Ödendi" },
              ],
            },
            {
              heading: "Alan Müşteri",
              fields: [
                { label: "Ad Soyad", value: c.buyer_name || "—" },
                { label: "Telefon", value: c.buyer_phone || "—" },
                { label: "Adres", value: c.buyer_address || "—" },
              ],
            }]
          : []),
        ...(c.notes ? [{ heading: "Notlar", text: c.notes }] : []),
      ],
      fileName: `Bilgisayar_${c.brand}_${c.model}`,
    });
  };

  const inStock = computers.filter(c => c.status === "stokta");
  const sold = computers.filter(c => c.status === "satildi");
  const totalRevenue = sold.reduce((s, c) => s + (c.sale_price || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Bilgisayar Satışları</h2>
        <Button size="sm" onClick={() => { if (showForm) resetForm(); else { setShowForm(true); setSellingId(null); } }} className="gap-1">
          <Plus className="h-4 w-4" /> Bilgisayar Ekle
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-muted-foreground font-medium">Stokta</span>
            </div>
            <p className="text-lg font-bold text-foreground">{inStock.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-[11px] text-muted-foreground font-medium">Satılan</span>
            </div>
            <p className="text-lg font-bold text-foreground">{sold.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-muted-foreground font-medium">Satış Geliri</span>
            </div>
            <p className="text-lg font-bold text-foreground">{totalRevenue.toLocaleString("tr-TR")}₺</p>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <Card className="border-primary/30 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Bilgisayarı Düzenle" : "Yeni Bilgisayar"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Marka * (ör. Lenovo)" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} maxLength={60} />
              <Input placeholder="Model * (ör. IdeaPad 3)" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} maxLength={80} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Seri Numarası" value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} maxLength={60} />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Durum</p>
                <select
                  value={form.condition}
                  onChange={e => setForm({ ...form, condition: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm"
                >
                  <option value="yeni">Yeni</option>
                  <option value="ikinci_el">2. El</option>
                  <option value="yenilenmis">Yenilenmiş</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="İşlemci (ör. i5-1235U)" value={form.cpu} onChange={e => setForm({ ...form, cpu: e.target.value })} maxLength={80} />
              <Input placeholder="Ekran Kartı (ör. RTX 3050)" value={form.gpu} onChange={e => setForm({ ...form, gpu: e.target.value })} maxLength={80} />
              <Input placeholder="RAM (ör. 16 GB DDR4)" value={form.ram_gb} onChange={e => setForm({ ...form, ram_gb: e.target.value })} maxLength={40} />
              <Input placeholder="Depolama (ör. 512 GB SSD)" value={form.storage} onChange={e => setForm({ ...form, storage: e.target.value })} maxLength={40} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="İşletim Sistemi (ör. Windows 11)" value={form.os} onChange={e => setForm({ ...form, os: e.target.value })} maxLength={60} />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Garanti (ay)</p>
                <Input type="number" value={form.warranty_months} onChange={e => setForm({ ...form, warranty_months: e.target.value })} min={0} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">📅 Alım Tarihi</p>
                <Input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">💰 Alış Fiyatı (₺)</p>
                <Input type="number" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} min={0} />
              </div>
            </div>
            <Input placeholder="Tedarikçi / Alınan Yer" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} maxLength={100} />
            <Input placeholder="Aksesuarlar (ör. çanta, mouse, şarj aleti)" value={form.accessories} onChange={e => setForm({ ...form, accessories: e.target.value })} maxLength={200} />
            <Textarea placeholder="Notlar" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={500} rows={2} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>İptal</Button>
              <Button onClick={handleSave}>{editingId ? "Güncelle" : "Kaydet"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Computer List */}
      <div className="space-y-2">
        {computers.length === 0 && <p className="text-center text-muted-foreground py-8">Henüz bilgisayar kaydı yok</p>}
        {computers.map(c => {
          const isSold = c.status === "satildi";
          return (
            <Card key={c.id} className={`border-border/50 ${isSold ? "opacity-90" : ""}`}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <Monitor className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-sm text-foreground">{c.brand} {c.model}</span>
                      <Badge className={`text-[11px] ${isSold
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"}`}>
                        {isSold ? "Satıldı" : "Stokta"}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {CONDITION_LABELS[c.condition] || c.condition}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {c.cpu && <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />{c.cpu}</span>}
                      {c.ram_gb && <span className="flex items-center gap-1"><MemoryStick className="h-3 w-3" />{c.ram_gb}</span>}
                      {c.storage && <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />{c.storage}</span>}
                      {c.gpu && <span>🎮 {c.gpu}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <CalendarDays className="h-3 w-3 inline mr-1" />
                      Alım: {new Date(c.purchase_date).toLocaleDateString("tr-TR")} · Alış: {c.purchase_price.toLocaleString("tr-TR")}₺
                      {c.serial_number && <> · SN: {c.serial_number}</>}
                    </p>
                    {isSold && (
                      <p className="text-xs text-green-400 mt-0.5">
                        💰 {(c.sale_price || 0).toLocaleString("tr-TR")}₺ · {c.sale_date ? new Date(c.sale_date).toLocaleDateString("tr-TR") : ""}
                        {c.buyer_name && <> · 👤 {c.buyer_name}</>}
                        {c.buyer_phone && <> · 📞 {c.buyer_phone}</>}
                      </p>
                    )}
                    {c.notes && <p className="text-xs text-muted-foreground mt-0.5">📝 {c.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="PDF yazdır" onClick={() => handlePrint(c)}>
                      <Printer className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Düzenle" onClick={() => handleEdit(c)}>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Sil" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Sale actions */}
                {!isSold && sellingId !== c.id && (
                  <Button size="sm" variant="outline" className="gap-1 text-green-500 border-green-500/40 hover:bg-green-500/10" onClick={() => { setSellingId(c.id); setShowForm(false); setSaleForm(emptySaleForm); }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Satıldı İşaretle
                  </Button>
                )}
                {isSold && (
                  <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground" onClick={() => handleUndoSale(c.id)}>
                    <Undo2 className="h-3.5 w-3.5" /> Satışı Geri Al
                  </Button>
                )}

                {/* Sale form */}
                {sellingId === c.id && !isSold && (
                  <Card className="border-green-500/30 animate-fade-in">
                    <CardContent className="p-3 space-y-3">
                      <p className="text-sm font-medium text-foreground">Satış Bilgileri</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">💰 Satış Fiyatı (₺) *</p>
                          <Input type="number" value={saleForm.sale_price} onChange={e => setSaleForm({ ...saleForm, sale_price: e.target.value })} min={0} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">📅 Satış Tarihi</p>
                          <Input type="date" value={saleForm.sale_date} onChange={e => setSaleForm({ ...saleForm, sale_date: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Alan Müşteri Ad Soyad" value={saleForm.buyer_name} onChange={e => setSaleForm({ ...saleForm, buyer_name: e.target.value })} maxLength={80} />
                        <Input placeholder="Müşteri Telefonu" value={saleForm.buyer_phone} onChange={e => setSaleForm({ ...saleForm, buyer_phone: e.target.value })} maxLength={20} />
                      </div>
                      <Input placeholder="Müşteri Adresi" value={saleForm.buyer_address} onChange={e => setSaleForm({ ...saleForm, buyer_address: e.target.value })} maxLength={200} />
                      <PaymentMethodSelector
                        method={saleForm.payment_method}
                        installments={saleForm.installments}
                        onChange={(method, installments) => setSaleForm({ ...saleForm, payment_method: method, installments })}
                        fee={parseFloat(saleForm.sale_price) || 0}
                        paid={0}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => { setSellingId(null); setSaleForm(emptySaleForm); }}>İptal</Button>
                        <Button size="sm" onClick={() => handleMarkSold(c.id)}>Satışı Onayla</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ComputerSalesManager;
