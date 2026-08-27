import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, ShieldCheck, Mic, MicOff, Search, X, FileDown, TrendingUp, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { exportTablePdf } from "@/lib/tablePdf";


interface SecurityProduct {
  id: string;
  name: string;
  category: string;
  variation: string | null;
  brand: string | null;
  model: string | null;
  specs: string | null;
  price: number;
  currency: string;
  stock: number;
  supplier: string | null;
  notes: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "kamera", label: "Kamera" },
  { value: "dvr", label: "DVR" },
  { value: "nvr", label: "NVR" },
  { value: "hdd", label: "Hard Disk" },
  { value: "kablo", label: "Kablo" },
  { value: "konnektor", label: "Konnektör" },
  { value: "adaptor", label: "Adaptör / Güç" },
  { value: "switch", label: "Switch / PoE" },
  { value: "monitor", label: "Monitör" },
  { value: "aksesuar", label: "Aksesuar" },
  { value: "diger", label: "Diğer" },
];

const VARIATIONS = ["IP", "AHD", "TVI", "CVI", "Analog", "PoE", "WiFi"];
const BRANDS = ["Dahua", "Hikvision", "OEM", "Uniview", "Longse", "TP-Link", "WD", "Seagate", "Diğer"];

const emptyForm = {
  name: "",
  category: "kamera",
  variation: "" as string,
  brand: "" as string,
  model: "",
  specs: "",
  price: "",
  currency: "TRY",
  stock: 0,
  supplier: "",
  notes: "",
  sort_order: 0,
  is_active: true,
};

type VoiceTarget = "name" | "model" | "specs" | "supplier" | "notes" | null;

const SecurityProductsManager = () => {
  const [items, setItems] = useState<SecurityProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterVariation, setFilterVariation] = useState<string>("all");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [voiceTarget, setVoiceTarget] = useState<VoiceTarget>(null);
  const [showMarket, setShowMarket] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketPrices, setMarketPrices] = useState<Record<string, { price: number; note?: string }>>({});
  const [applying, setApplying] = useState(false);

  const { toast } = useToast();

  const handleVoiceResult = useCallback((text: string) => {
    setForm(prev => {
      if (!voiceTarget) return prev;
      const current = (prev as any)[voiceTarget] as string;
      return { ...prev, [voiceTarget]: current ? `${current} ${text}` : text };
    });
    setVoiceTarget(null);
  }, [voiceTarget]);

  const voice = useVoiceInput(handleVoiceResult, "tr-TR");

  const startVoice = (target: Exclude<VoiceTarget, null>) => {
    if (!voice.supported) {
      toast({ title: "Bu tarayıcı sesli girişi desteklemiyor", description: "Chrome / Edge kullanmayı deneyin.", variant: "destructive" });
      return;
    }
    setVoiceTarget(target);
    voice.start();
  };

  const stopVoice = () => {
    voice.stop();
    setVoiceTarget(null);
  };

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("security_products" as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Yüklenemedi", description: error.message, variant: "destructive" });
      return;
    }
    setItems((data as unknown as SecurityProduct[]) || []);
  }, [toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    stopVoice();
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Ürün adı zorunludur", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      category: form.category,
      variation: form.variation.trim() || null,
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      specs: form.specs.trim() || null,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      stock: form.stock,
      supplier: form.supplier.trim() || null,
      notes: form.notes.trim() || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("security_products" as any).update(payload).eq("id", editingId);
      if (error) { toast({ title: "Güncellenemedi", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Güncellendi" });
    } else {
      const { error } = await supabase.from("security_products" as any).insert(payload);
      if (error) { toast({ title: "Eklenemedi", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Ürün eklendi" });
    }
    resetForm();
    await fetchItems();
  };

  const startEdit = (p: SecurityProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      variation: p.variation || "",
      brand: p.brand || "",
      model: p.model || "",
      specs: p.specs || "",
      price: p.price?.toString() || "",
      currency: p.currency || "TRY",
      stock: p.stock ?? 0,
      supplier: p.supplier || "",
      notes: p.notes || "",
      sort_order: p.sort_order,
      is_active: p.is_active,
    });
    setShowForm(true);
  };

  const quickPriceUpdate = async (id: string, newPrice: number) => {
    const { error } = await supabase.from("security_products" as any).update({ price: newPrice }).eq("id", id);
    if (error) { toast({ title: "Fiyat güncellenemedi", description: error.message, variant: "destructive" }); return; }
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
    await supabase.from("security_products" as any).delete().eq("id", id);
    toast({ title: "Silindi" });
    await fetchItems();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(p => {
      if (filterCategory !== "all" && p.category !== filterCategory) return false;
      if (filterVariation !== "all" && (p.variation || "") !== filterVariation) return false;
      if (filterBrand !== "all" && (p.brand || "") !== filterBrand) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.model || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.specs || "").toLowerCase().includes(q)
      );
    });
  }, [items, search, filterCategory, filterVariation, filterBrand]);

  const totalValue = useMemo(() => items.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0), [items]);
  const priced = items.filter(p => (p.price || 0) > 0).length;

  const catLabelOf = (v: string) => CATEGORIES.find(c => c.value === v)?.label || v;

  const handleExportPdf = async () => {
    const activeFilters = [
      filterCategory !== "all" ? `Kategori: ${catLabelOf(filterCategory)}` : null,
      filterVariation !== "all" ? `Varyasyon: ${filterVariation}` : null,
      filterBrand !== "all" ? `Marka: ${filterBrand}` : null,
      search.trim() ? `Arama: "${search.trim()}"` : null,
    ].filter(Boolean).join(" · ");

    await exportTablePdf({
      title: "Güvenlik Sistemleri Fiyat Listesi",
      subtitle: activeFilters || "Tüm kayıtlar",
      columns: ["Ürün", "Kategori", "Varyasyon", "Marka", "Model", "Stok", "Fiyat", "Tedarikçi"],
      rows: filtered.map(p => [
        p.name,
        catLabelOf(p.category),
        p.variation || "-",
        p.brand || "-",
        p.model || "-",
        p.stock ?? 0,
        `${(p.price || 0).toLocaleString("tr-TR")} ${p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : "₺"}`,
        p.supplier || "-",
      ]),
      summary: [
        { label: "Kalem", value: String(filtered.length) },
        { label: "Stok Değeri", value: `${filtered.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0).toLocaleString("tr-TR")} ₺` },
      ],
      fileName: "Guvenlik_Fiyat_Listesi",
    });
  };

  const toggleMarketPrices = async () => {
    if (showMarket) {
      setShowMarket(false);
      setMarketPrices({});
      return;
    }
    if (filtered.length === 0) { toast({ title: "Listede ürün yok" }); return; }
    setMarketLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-prices", {
        body: {
          items: filtered.map(p => ({
            id: p.id, name: p.name, category: p.category, variation: p.variation, brand: p.brand, model: p.model, price: p.price,
          })),
        },
      });
      if (error) throw error;
      const map: Record<string, { price: number; note?: string }> = {};
      (data?.prices || []).forEach((x: any) => {
        if (x?.id && typeof x.price === "number") map[x.id] = { price: x.price, note: x.note };
      });
      if (Object.keys(map).length === 0) { toast({ title: "Güncel fiyat alınamadı", variant: "destructive" }); return; }
      setMarketPrices(map);
      setShowMarket(true);
      toast({ title: `${Object.keys(map).length} ürün için güncel fiyat önerisi hazır` });
    } catch (e: any) {
      toast({ title: "Güncel fiyatlar alınamadı", description: e?.message, variant: "destructive" });
    } finally {
      setMarketLoading(false);
    }
  };

  const applyMarketPrice = async (id: string) => {
    const suggestion = marketPrices[id];
    if (!suggestion) return;
    const { error } = await supabase.from("security_products" as any).update({ price: suggestion.price }).eq("id", id);
    if (error) { toast({ title: "Uygulanamadı", description: error.message, variant: "destructive" }); return; }
    await fetchItems();
    toast({ title: "Fiyat güncellendi" });
  };

  const applyAllMarketPrices = async () => {
    const entries = filtered.filter(p => marketPrices[p.id]);
    if (!entries.length) return;
    if (!confirm(`${entries.length} ürünün fiyatı güncel önerilerle değiştirilecek. Onaylıyor musun?`)) return;
    setApplying(true);
    try {
      for (const p of entries) {
        await supabase.from("security_products" as any).update({ price: marketPrices[p.id].price }).eq("id", p.id);
      }
      await fetchItems();
      toast({ title: `${entries.length} ürünün fiyatı güncellendi` });
    } finally {
      setApplying(false);
    }
  };


  const MicButton = ({ target, className }: { target: Exclude<VoiceTarget, null>; className?: string }) => {
    const active = voiceTarget === target && voice.listening;
    return (
      <Button
        type="button"
        size="sm"
        variant={active ? "default" : "outline"}
        className={`shrink-0 ${active ? "animate-pulse" : ""} ${className || ""}`}
        onClick={() => (active ? stopVoice() : startVoice(target))}
        title={voice.supported ? (active ? "Dinlemeyi durdur" : "Sesle doldur") : "Bu tarayıcı desteklemiyor"}
        disabled={!voice.supported}
      >
        {active ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Güvenlik Sistemleri Fiyat Listesi</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleExportPdf} className="gap-1">
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button
            size="sm"
            variant={showMarket ? "default" : "outline"}
            onClick={toggleMarketPrices}
            disabled={marketLoading}
            className="gap-1"
          >
            {marketLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            {showMarket ? "Güncel Fiyatları Kapat" : "Güncel Fiyatlar"}
          </Button>
          {showMarket && (
            <Button size="sm" variant="secondary" onClick={applyAllMarketPrices} disabled={applying} className="gap-1">
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Tümünü Kaydet
            </Button>
          )}
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1">
            <Plus className="h-4 w-4" /> Yeni Malzeme
          </Button>
        </div>
      </div>

      {showMarket && (
        <p className="text-[11px] text-muted-foreground border border-primary/30 rounded-md p-2">
          Güncel fiyatlar yapay zekâ ile Türkiye piyasası baz alınarak tahmin edilir; yaklaşık değerlerdir. Tek tek "Uygula" veya "Tümünü Kaydet" ile mevcut fiyatların üzerine yazabilirsin.
        </p>
      )}


      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-[11px] text-muted-foreground">Toplam Kalem</p>
          <p className="text-lg font-bold">{items.length}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-[11px] text-muted-foreground">Fiyatı Girilmiş</p>
          <p className="text-lg font-bold">{priced} / {items.length}</p>
        </CardContent></Card>
        <Card className="border-primary/30 col-span-2 md:col-span-1"><CardContent className="p-3">
          <p className="text-[11px] text-muted-foreground">Stok Değeri</p>
          <p className="text-lg font-bold text-primary">{totalValue.toLocaleString("tr-TR")} ₺</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterVariation} onValueChange={setFilterVariation}>
            <SelectTrigger><SelectValue placeholder="Varyasyon" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Varyasyonlar</SelectItem>
              {VARIATIONS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger><SelectValue placeholder="Marka" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Markalar</SelectItem>
              {BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-primary/30 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{editingId ? "Malzemeyi Düzenle" : "Yeni Malzeme"}</CardTitle>
            {voice.supported && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Mic className="h-3 w-3" /> Mikrofon simgesine basıp konuşarak doldurabilirsiniz
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ürün Adı *</p>
              <div className="flex gap-2">
                <Input placeholder="Örn: 2MP Bullet Kamera" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={150} />
                <MicButton target="name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Kategori</p>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Varyasyon (IP / AHD / vb.)</p>
                <Select value={form.variation || "none"} onValueChange={(v) => setForm({ ...form, variation: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Yok" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Yok</SelectItem>
                    {VARIATIONS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Marka</p>
                <Select value={form.brand || "none"} onValueChange={(v) => setForm({ ...form, brand: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Yok" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Yok</SelectItem>
                    {BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Model</p>
              <div className="flex gap-2">
                <Input placeholder="Örn: DS-2CE16D0T-IRPF" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} maxLength={100} />
                <MicButton target="model" />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Özellikler / Notlar</p>
              <div className="flex gap-2">
                <Textarea placeholder="Çözünürlük, gece görüşü, lens vb." value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} maxLength={500} rows={2} />
                <MicButton target="specs" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fiyat</p>
                <Input type="number" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min={0} step="0.01" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Para Birimi</p>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">₺ TRY</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Stok</p>
                <Input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} min={0} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sıra</p>
                <Input type="number" placeholder="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Tedarikçi</p>
              <div className="flex gap-2">
                <Input placeholder="Tedarikçi adı" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} maxLength={100} />
                <MicButton target="supplier" />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Genel Not</p>
              <div className="flex gap-2">
                <Textarea placeholder="Serbest not" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} rows={2} />
                <MicButton target="notes" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary" />
              Aktif
            </label>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>İptal</Button>
              <Button onClick={handleSave}>{editingId ? "Güncelle" : "Kaydet"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">Kayıt bulunamadı</p>
        )}
        {filtered.map((p) => {
          const catLabel = CATEGORIES.find(c => c.value === p.category)?.label || p.category;
          const currencySymbol = p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : "₺";
          return (
            <Card key={p.id} className={`border-border/50 ${!p.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{p.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{catLabel}</Badge>
                      {p.variation && <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">{p.variation}</Badge>}
                      {p.brand && <Badge variant="outline" className="text-[10px]">{p.brand}</Badge>}
                      {!p.is_active && <Badge variant="outline" className="text-[10px]">Pasif</Badge>}
                    </div>
                    {(p.model || p.specs) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.model && <span className="mr-2">{p.model}</span>}
                        {p.specs && <span>{p.specs}</span>}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                      <span>Stok: {p.stock}</span>
                      {p.supplier && <span>Tedarikçi: {p.supplier}</span>}
                    </div>
                    {showMarket && marketPrices[p.id] && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] rounded-md border border-primary/30 bg-primary/5 p-2">
                        <span className="text-muted-foreground">Güncel piyasa:</span>
                        <span className="font-bold text-primary">{marketPrices[p.id].price.toLocaleString("tr-TR")} ₺</span>
                        {marketPrices[p.id].note && <span className="text-muted-foreground">{marketPrices[p.id].note}</span>}
                        <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={() => applyMarketPrice(p.id)}>
                          Uygula
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={p.price ?? 0}
                        onChange={(e) => quickPriceUpdate(p.id, parseFloat(e.target.value) || 0)}
                        className="h-8 w-24 text-sm text-right"
                        min={0}
                        step="0.01"
                      />
                      <span className="text-sm font-semibold text-primary">{currencySymbol}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(p)}>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityProductsManager;