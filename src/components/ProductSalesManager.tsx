import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ShoppingCart, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number | null;
  stock: number;
}

interface ProductSale {
  id: string;
  product_id: string | null;
  product_name: string;
  sale_price: number;
  sale_date: string;
  notes: string | null;
  created_at: string;
}

const ProductSalesManager = () => {
  const [sales, setSales] = useState<ProductSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    product_name: "",
    sale_price: "",
    sale_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    const [{ data: salesData }, { data: prodData }] = await Promise.all([
      (supabase as any).from("product_sales").select("*").order("sale_date", { ascending: false }),
      supabase.from("products").select("id, name, price, stock").eq("is_active", true).order("name"),
    ]);
    if (salesData) setSales(salesData as ProductSale[]);
    if (prodData) setProducts(prodData as unknown as Product[]);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleProductSelect = (productId: string) => {
    const p = products.find(pr => pr.id === productId);
    if (p) {
      setForm({
        ...form,
        product_id: p.id,
        product_name: p.name,
        sale_price: p.price?.toString() || "",
      });
    }
  };

  const handleSave = async () => {
    if (!form.product_name.trim()) {
      toast({ title: "Ürün adı zorunludur", variant: "destructive" });
      return;
    }
    await (supabase as any).from("product_sales").insert({
      product_id: form.product_id || null,
      product_name: form.product_name.trim(),
      sale_price: parseFloat(form.sale_price) || 0,
      sale_date: form.sale_date || new Date().toISOString(),
      notes: form.notes.trim() || null,
    });
    toast({ title: "Satış kaydedildi!" });
    setForm({ product_id: "", product_name: "", sale_price: "", sale_date: new Date().toISOString().slice(0, 10), notes: "" });
    setShowForm(false);
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("product_sales").delete().eq("id", id);
    toast({ title: "Satış silindi" });
    await fetchData();
  };

  const totalRevenue = sales.reduce((s, sale) => s + sale.sale_price, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Ürün Satışları</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus className="h-4 w-4" /> Satış Ekle
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-muted-foreground font-medium">Toplam Satış</span>
            </div>
            <p className="text-lg font-bold text-foreground">{totalRevenue.toLocaleString("tr-TR")}₺</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-muted-foreground font-medium">Satış Sayısı</span>
            </div>
            <p className="text-lg font-bold text-foreground">{sales.length}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-primary/30 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Yeni Satış</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">📦 Ürün Seç</p>
              <select
                value={form.product_id}
                onChange={e => handleProductSelect(e.target.value)}
                className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm"
              >
                <option value="">— Listeden seç veya elle gir —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.price ? `(${p.price}₺)` : ""} — Stok: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <Input placeholder="Ürün Adı *" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} maxLength={100} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">💰 Satış Fiyatı (₺)</p>
                <Input type="number" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} min={0} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">📅 Satış Tarihi</p>
                <Input type="date" value={form.sale_date} onChange={e => setForm({ ...form, sale_date: e.target.value })} />
              </div>
            </div>
            <Textarea placeholder="Notlar" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={300} rows={2} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
              <Button onClick={handleSave}>Kaydet</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <div className="space-y-2">
        {sales.length === 0 && <p className="text-center text-muted-foreground py-8">Henüz satış kaydı yok</p>}
        {sales.map(sale => (
          <Card key={sale.id} className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium text-sm text-foreground">{sale.product_name}</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[11px]">
                      {sale.sale_price.toLocaleString("tr-TR")}₺
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    📅 {new Date(sale.sale_date).toLocaleDateString("tr-TR")}
                  </p>
                  {sale.notes && <p className="text-xs text-muted-foreground mt-0.5">📝 {sale.notes}</p>}
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(sale.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductSalesManager;
