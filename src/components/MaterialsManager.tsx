import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Pencil, Save, X, Package2, ShoppingCart, AlertTriangle,
  Check, ArrowDown, ArrowUp, History, Boxes, ListChecks
} from "lucide-react";

type Material = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  current_stock: number;
  min_stock: number;
  unit_cost: number | null;
  supplier: string | null;
  location: string | null;
  notes: string | null;
};

type Movement = {
  id: string;
  material_id: string;
  movement_type: string;
  quantity: number;
  notes: string | null;
  created_at: string;
};

type ShoppingItem = {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  priority: string;
  estimated_cost: number | null;
  supplier: string | null;
  notes: string | null;
  is_purchased: boolean;
  purchased_at: string | null;
  material_id: string | null;
};

const UNITS = ["adet", "metre", "top", "kg", "kutu", "paket", "rulo"];
const PRIORITIES: Record<string, { label: string; color: string }> = {
  urgent: { label: "Acil", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  normal: { label: "Normal", color: "bg-primary/20 text-primary border-primary/30" },
  low: { label: "Düşük", color: "bg-muted text-muted-foreground border-border" },
};

const MaterialsManager = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [showMatForm, setShowMatForm] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [editingMat, setEditingMat] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const [adjust, setAdjust] = useState<Record<string, string>>({});

  const [matForm, setMatForm] = useState({
    name: "", category: "", unit: "adet",
    current_stock: "", min_stock: "", unit_cost: "",
    supplier: "", location: "", notes: "",
  });
  const [editForm, setEditForm] = useState<Partial<Material>>({});

  const [shopForm, setShopForm] = useState({
    item_name: "", quantity: "1", unit: "adet",
    priority: "normal", estimated_cost: "", supplier: "", notes: "",
  });

  const refresh = useCallback(async () => {
    const [{ data: mats }, { data: movs }, { data: shop }] = await Promise.all([
      (supabase as any).from("materials").select("*").order("name"),
      (supabase as any).from("material_movements").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("shopping_list").select("*").order("is_purchased").order("created_at", { ascending: false }),
    ]);
    setMaterials(mats || []);
    setMovements(movs || []);
    setShopping(shop || []);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ---- Materials ----
  const addMaterial = async () => {
    if (!matForm.name.trim()) { toast({ title: "Malzeme adı zorunlu", variant: "destructive" }); return; }
    const { error } = await (supabase as any).from("materials").insert({
      name: matForm.name.trim(),
      category: matForm.category.trim() || null,
      unit: matForm.unit,
      current_stock: parseFloat(matForm.current_stock) || 0,
      min_stock: parseFloat(matForm.min_stock) || 0,
      unit_cost: matForm.unit_cost ? parseFloat(matForm.unit_cost) : null,
      supplier: matForm.supplier.trim() || null,
      location: matForm.location.trim() || null,
      notes: matForm.notes.trim() || null,
    });
    if (error) { toast({ title: "Eklenemedi", description: error.message, variant: "destructive" }); return; }
    setMatForm({ name: "", category: "", unit: "adet", current_stock: "", min_stock: "", unit_cost: "", supplier: "", location: "", notes: "" });
    setShowMatForm(false);
    await refresh();
    toast({ title: "Malzeme eklendi" });
  };

  const startEditMat = (m: Material) => { setEditingMat(m.id); setEditForm({ ...m }); };
  const cancelEditMat = () => { setEditingMat(null); setEditForm({}); };
  const saveEditMat = async (id: string) => {
    const { error } = await (supabase as any).from("materials").update({
      name: editForm.name, category: editForm.category || null, unit: editForm.unit,
      current_stock: Number(editForm.current_stock) || 0,
      min_stock: Number(editForm.min_stock) || 0,
      unit_cost: editForm.unit_cost ?? null,
      supplier: editForm.supplier || null,
      location: editForm.location || null,
      notes: editForm.notes || null,
    }).eq("id", id);
    if (error) { toast({ title: "Kaydedilemedi", variant: "destructive" }); return; }
    cancelEditMat();
    await refresh();
    toast({ title: "Güncellendi" });
  };
  const deleteMat = async (id: string) => {
    if (!confirm("Bu malzemeyi silmek istiyor musunuz?")) return;
    await (supabase as any).from("materials").delete().eq("id", id);
    await refresh();
  };

  const adjustStock = async (m: Material, delta: number) => {
    const raw = adjust[m.id];
    const qty = Math.abs(parseFloat(raw || "0"));
    if (!qty) { toast({ title: "Miktar giriniz", variant: "destructive" }); return; }
    const newStock = Number(m.current_stock) + delta * qty;
    await (supabase as any).from("materials").update({ current_stock: newStock }).eq("id", m.id);
    await (supabase as any).from("material_movements").insert({
      material_id: m.id,
      movement_type: delta > 0 ? "in" : "out",
      quantity: qty,
    });
    setAdjust({ ...adjust, [m.id]: "" });
    await refresh();
    toast({ title: delta > 0 ? "Stok girişi yapıldı" : "Stok çıkışı yapıldı" });
  };

  // ---- Shopping ----
  const addShop = async () => {
    if (!shopForm.item_name.trim()) { toast({ title: "Ürün adı zorunlu", variant: "destructive" }); return; }
    const { error } = await (supabase as any).from("shopping_list").insert({
      item_name: shopForm.item_name.trim(),
      quantity: parseFloat(shopForm.quantity) || 1,
      unit: shopForm.unit,
      priority: shopForm.priority,
      estimated_cost: shopForm.estimated_cost ? parseFloat(shopForm.estimated_cost) : null,
      supplier: shopForm.supplier.trim() || null,
      notes: shopForm.notes.trim() || null,
    });
    if (error) { toast({ title: "Eklenemedi", variant: "destructive" }); return; }
    setShopForm({ item_name: "", quantity: "1", unit: "adet", priority: "normal", estimated_cost: "", supplier: "", notes: "" });
    setShowShopForm(false);
    await refresh();
    toast({ title: "Listeye eklendi" });
  };

  const togglePurchased = async (s: ShoppingItem) => {
    await (supabase as any).from("shopping_list").update({
      is_purchased: !s.is_purchased,
      purchased_at: !s.is_purchased ? new Date().toISOString() : null,
    }).eq("id", s.id);
    await refresh();
  };

  const deleteShop = async (id: string) => {
    await (supabase as any).from("shopping_list").delete().eq("id", id);
    await refresh();
  };

  const addLowStockToList = async () => {
    const low = materials.filter(m => Number(m.current_stock) <= Number(m.min_stock) && Number(m.min_stock) > 0);
    if (!low.length) { toast({ title: "Kritik stok yok" }); return; }
    // avoid duplicates already in unpurchased list
    const activeNames = new Set(shopping.filter(s => !s.is_purchased).map(s => s.item_name.toLowerCase()));
    const rows = low.filter(m => !activeNames.has(m.name.toLowerCase())).map(m => ({
      item_name: m.name,
      quantity: Math.max(1, Number(m.min_stock) - Number(m.current_stock)),
      unit: m.unit,
      priority: "urgent",
      supplier: m.supplier,
      material_id: m.id,
    }));
    if (!rows.length) { toast({ title: "Zaten listede" }); return; }
    await (supabase as any).from("shopping_list").insert(rows);
    await refresh();
    toast({ title: `${rows.length} malzeme listeye eklendi` });
  };

  const clearPurchased = async () => {
    const ids = shopping.filter(s => s.is_purchased).map(s => s.id);
    if (!ids.length) return;
    await (supabase as any).from("shopping_list").delete().in("id", ids);
    await refresh();
  };

  // ---- Derived ----
  const totalInventoryValue = materials.reduce((s, m) => s + (Number(m.unit_cost) || 0) * Number(m.current_stock), 0);
  const lowStockCount = materials.filter(m => Number(m.current_stock) <= Number(m.min_stock) && Number(m.min_stock) > 0).length;
  const pendingShopCount = shopping.filter(s => !s.is_purchased).length;
  const estimatedShopCost = shopping.filter(s => !s.is_purchased).reduce((s, x) => s + (Number(x.estimated_cost) || 0) * Number(x.quantity), 0);
  const fmt = (n: number) => `${(n || 0).toLocaleString("tr-TR")}₺`;

  const pending = shopping.filter(s => !s.is_purchased);
  const purchased = shopping.filter(s => s.is_purchased);
  const prioOrder: Record<string, number> = { urgent: 0, normal: 1, low: 2 };
  const sortedPending = [...pending].sort((a, b) => (prioOrder[a.priority] ?? 9) - (prioOrder[b.priority] ?? 9));

  return (
    <div className="space-y-6">
      {/* Özet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Boxes className="h-3.5 w-3.5" /> Toplam Malzeme</div>
            <p className="text-xl font-bold text-foreground">{materials.length}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5 text-orange-400" /> Kritik Stok</div>
            <p className="text-xl font-bold text-orange-400">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><ShoppingCart className="h-3.5 w-3.5" /> Alınacak</div>
            <p className="text-xl font-bold text-foreground">{pendingShopCount}</p>
            {estimatedShopCost > 0 && <p className="text-[10px] text-muted-foreground">~ {fmt(estimatedShopCost)}</p>}
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Package2 className="h-3.5 w-3.5" /> Stok Değeri</div>
            <p className="text-xl font-bold text-green-400">{fmt(totalInventoryValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alınacaklar Listesi - EN ÜSTTE */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <ListChecks className="h-5 w-5" /> Alınacaklar Listesi
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={addLowStockToList} className="gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Kritik Stokları Ekle
              </Button>
              {purchased.length > 0 && (
                <Button size="sm" variant="outline" onClick={clearPurchased} className="gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Alınanları Temizle
                </Button>
              )}
              <Button size="sm" onClick={() => setShowShopForm(!showShopForm)} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Ekle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showShopForm && (
            <div className="p-3 border border-primary/30 rounded-lg space-y-2 bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Ürün adı *" value={shopForm.item_name} onChange={(e) => setShopForm({ ...shopForm, item_name: e.target.value })} />
                <div className="flex gap-2">
                  <Input type="number" placeholder="Miktar" value={shopForm.quantity} onChange={(e) => setShopForm({ ...shopForm, quantity: e.target.value })} />
                  <select className="flex h-10 rounded-md border border-input bg-background px-2 text-sm" value={shopForm.unit} onChange={(e) => setShopForm({ ...shopForm, unit: e.target.value })}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <select className="flex h-10 rounded-md border border-input bg-background px-2 text-sm" value={shopForm.priority} onChange={(e) => setShopForm({ ...shopForm, priority: e.target.value })}>
                  <option value="urgent">Acil</option>
                  <option value="normal">Normal</option>
                  <option value="low">Düşük</option>
                </select>
                <Input type="number" placeholder="Tahmini birim fiyat ₺" value={shopForm.estimated_cost} onChange={(e) => setShopForm({ ...shopForm, estimated_cost: e.target.value })} />
                <Input placeholder="Tedarikçi" value={shopForm.supplier} onChange={(e) => setShopForm({ ...shopForm, supplier: e.target.value })} />
                <Input placeholder="Not" value={shopForm.notes} onChange={(e) => setShopForm({ ...shopForm, notes: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowShopForm(false)}>İptal</Button>
                <Button size="sm" onClick={addShop}>Kaydet</Button>
              </div>
            </div>
          )}

          {sortedPending.length === 0 && purchased.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Liste boş. Kritik stoktaki malzemeleri hızlıca eklemek için üstteki butonu kullanabilirsiniz.</p>
          )}

          {sortedPending.map((s) => {
            const p = PRIORITIES[s.priority] || PRIORITIES.normal;
            return (
              <div key={s.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/40 transition-colors">
                <button onClick={() => togglePurchased(s)} className="h-6 w-6 rounded border border-border hover:border-primary flex items-center justify-center flex-shrink-0" aria-label="Alındı">
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{s.item_name}</span>
                    <Badge variant="outline" className={p.color}>{p.label}</Badge>
                    <span className="text-xs text-muted-foreground">{Number(s.quantity).toLocaleString("tr-TR")} {s.unit}</span>
                    {s.estimated_cost != null && <span className="text-xs text-green-400">~ {fmt(Number(s.estimated_cost) * Number(s.quantity))}</span>}
                  </div>
                  {(s.supplier || s.notes) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.supplier && <span>{s.supplier}</span>}{s.supplier && s.notes && " · "}{s.notes}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteShop(s.id)} className="text-red-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {purchased.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Alınanlar ({purchased.length})</p>
              {purchased.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 opacity-60">
                  <button onClick={() => togglePurchased(s)} className="h-6 w-6 rounded bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  </button>
                  <span className="flex-1 line-through text-sm">{s.item_name} — {Number(s.quantity).toLocaleString("tr-TR")} {s.unit}</span>
                  <Button size="sm" variant="ghost" onClick={() => deleteShop(s.id)} className="text-red-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Malzemeler / Stok */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package2 className="h-5 w-5 text-primary" /> Malzeme Stoğu
            </CardTitle>
            <Button size="sm" onClick={() => setShowMatForm(!showMatForm)} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Yeni Malzeme
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showMatForm && (
            <div className="p-3 border border-primary/30 rounded-lg space-y-2 bg-primary/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Ad *  (örn: Cat6 Kablo)" value={matForm.name} onChange={(e) => setMatForm({ ...matForm, name: e.target.value })} />
                <Input placeholder="Kategori (örn: Kablo)" value={matForm.category} onChange={(e) => setMatForm({ ...matForm, category: e.target.value })} />
                <select className="flex h-10 rounded-md border border-input bg-background px-2 text-sm" value={matForm.unit} onChange={(e) => setMatForm({ ...matForm, unit: e.target.value })}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <Input type="number" placeholder="Mevcut stok" value={matForm.current_stock} onChange={(e) => setMatForm({ ...matForm, current_stock: e.target.value })} />
                <Input type="number" placeholder="Kritik seviye" value={matForm.min_stock} onChange={(e) => setMatForm({ ...matForm, min_stock: e.target.value })} />
                <Input type="number" placeholder="Birim fiyat ₺" value={matForm.unit_cost} onChange={(e) => setMatForm({ ...matForm, unit_cost: e.target.value })} />
                <Input placeholder="Tedarikçi" value={matForm.supplier} onChange={(e) => setMatForm({ ...matForm, supplier: e.target.value })} />
                <Input placeholder="Konum (örn: Depo A)" value={matForm.location} onChange={(e) => setMatForm({ ...matForm, location: e.target.value })} />
              </div>
              <Textarea placeholder="Not" value={matForm.notes} onChange={(e) => setMatForm({ ...matForm, notes: e.target.value })} rows={2} />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowMatForm(false)}>İptal</Button>
                <Button size="sm" onClick={addMaterial}>Kaydet</Button>
              </div>
            </div>
          )}

          {materials.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Henüz malzeme eklenmemiş.</p>
          )}

          {materials.map((m) => {
            const low = Number(m.current_stock) <= Number(m.min_stock) && Number(m.min_stock) > 0;
            const isEditing = editingMat === m.id;
            const history = movements.filter(mv => mv.material_id === m.id).slice(0, 10);
            return (
              <div key={m.id} className={`p-3 border rounded-lg ${low ? "border-orange-500/40 bg-orange-500/5" : "border-border"}`}>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Ad" />
                      <Input value={editForm.category || ""} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="Kategori" />
                      <select className="flex h-10 rounded-md border border-input bg-background px-2 text-sm" value={editForm.unit || "adet"} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}>
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <Input type="number" value={editForm.current_stock ?? 0} onChange={(e) => setEditForm({ ...editForm, current_stock: Number(e.target.value) })} placeholder="Stok" />
                      <Input type="number" value={editForm.min_stock ?? 0} onChange={(e) => setEditForm({ ...editForm, min_stock: Number(e.target.value) })} placeholder="Kritik" />
                      <Input type="number" value={editForm.unit_cost ?? ""} onChange={(e) => setEditForm({ ...editForm, unit_cost: e.target.value === "" ? null : Number(e.target.value) })} placeholder="Birim fiyat" />
                      <Input value={editForm.supplier || ""} onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })} placeholder="Tedarikçi" />
                      <Input value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="Konum" />
                    </div>
                    <Textarea value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={2} placeholder="Not" />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={cancelEditMat}><X className="h-4 w-4" /></Button>
                      <Button size="sm" onClick={() => saveEditMat(m.id)}><Save className="h-4 w-4 mr-1" /> Kaydet</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{m.name}</span>
                          {m.category && <Badge variant="outline" className="text-[10px]">{m.category}</Badge>}
                          {low && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40"><AlertTriangle className="h-3 w-3 mr-1" />Kritik</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span>Stok: <strong className={low ? "text-orange-400" : "text-foreground"}>{Number(m.current_stock).toLocaleString("tr-TR")} {m.unit}</strong></span>
                          {Number(m.min_stock) > 0 && <span>Min: {Number(m.min_stock).toLocaleString("tr-TR")}</span>}
                          {m.unit_cost != null && <span>Birim: {fmt(Number(m.unit_cost))}</span>}
                          {m.unit_cost != null && <span className="text-green-400">Değer: {fmt(Number(m.unit_cost) * Number(m.current_stock))}</span>}
                          {m.supplier && <span>Tedarikçi: {m.supplier}</span>}
                          {m.location && <span>Konum: {m.location}</span>}
                        </div>
                        {m.notes && <p className="text-xs text-muted-foreground mt-1 italic">{m.notes}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setHistoryOpen(historyOpen === m.id ? null : m.id)} title="Hareket geçmişi">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => startEditMat(m)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMat(m.id)} className="text-red-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Input
                        type="number"
                        placeholder="Miktar"
                        value={adjust[m.id] || ""}
                        onChange={(e) => setAdjust({ ...adjust, [m.id]: e.target.value })}
                        className="h-8 w-28"
                      />
                      <Button size="sm" variant="outline" onClick={() => adjustStock(m, 1)} className="h-8 gap-1 text-green-400 border-green-500/30 hover:bg-green-500/10">
                        <ArrowUp className="h-3.5 w-3.5" /> Giriş
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => adjustStock(m, -1)} className="h-8 gap-1 text-orange-400 border-orange-500/30 hover:bg-orange-500/10">
                        <ArrowDown className="h-3.5 w-3.5" /> Çıkış
                      </Button>
                    </div>

                    {historyOpen === m.id && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Son hareketler</p>
                        {history.length === 0 && <p className="text-xs text-muted-foreground">Kayıt yok</p>}
                        {history.map(h => (
                          <div key={h.id} className="flex items-center justify-between text-xs">
                            <span className={h.movement_type === "in" ? "text-green-400" : "text-orange-400"}>
                              {h.movement_type === "in" ? "▲ Giriş" : "▼ Çıkış"} {Number(h.quantity).toLocaleString("tr-TR")} {m.unit}
                            </span>
                            <span className="text-muted-foreground">{new Date(h.created_at).toLocaleString("tr-TR")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsManager;