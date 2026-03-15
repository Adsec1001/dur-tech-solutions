import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Package, XCircle, GripVertical, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_urls: string[];
  features: string[];
  is_active: boolean;
  sort_order: number;
  stock: number;
  created_at: string;
}

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  features: [] as string[],
  is_active: true,
  sort_order: 0,
  stock: 0,
  image_urls: [] as string[],
};

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newFeature, setNewFeature] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setProducts(data as unknown as Product[]);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);
    if (error) {
      toast({ title: "Görsel yüklenemedi", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) newUrls.push(url);
    }
    setForm(prev => ({ ...prev, image_urls: [...prev.image_urls, ...newUrls] }));
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, i) => i !== idx) }));
  };

  // Drag and drop for image reordering
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setForm(prev => {
      const urls = [...prev.image_urls];
      const [moved] = urls.splice(dragIdx, 1);
      urls.splice(idx, 0, moved);
      return { ...prev, image_urls: urls };
    });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Ürün adı zorunludur", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      price: parseFloat(form.price) || null,
      features: form.features,
      is_active: form.is_active,
      sort_order: form.sort_order,
      stock: form.stock,
      image_urls: form.image_urls,
    };

    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
      toast({ title: "Ürün güncellendi!" });
    } else {
      await supabase.from("products").insert(payload);
      toast({ title: "Ürün eklendi!" });
    }

    resetForm();
    await fetchProducts();
  };

  const resetForm = () => {
    setForm(emptyForm);
    setNewFeature("");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      category: p.category || "",
      price: p.price?.toString() || "",
      features: p.features || [],
      is_active: p.is_active,
      sort_order: p.sort_order,
      stock: p.stock ?? 0,
      image_urls: p.image_urls || [],
    });
    setShowForm(true);
  };

  const decrementStock = async (p: Product) => {
    if (p.stock <= 0) {
      toast({ title: "Stok zaten 0", variant: "destructive" });
      return;
    }
    await supabase.from("products").update({ stock: p.stock - 1 }).eq("id", p.id);
    toast({ title: `${p.name} stoktan 1 adet düşüldü (Kalan: ${p.stock - 1})` });
    await fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Ürün silindi" });
    await fetchProducts();
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm({ ...form, features: [...form.features, newFeature.trim()] });
    setNewFeature("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Ürün Yönetimi</h2>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-1">
          <Plus className="h-4 w-4" /> Yeni Ürün
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Ürün Adı *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
            <Input placeholder="Kategori (örn: Mouse, Klavye)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} maxLength={50} />
            <Textarea placeholder="Açıklama" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} rows={2} />
            <Input type="number" placeholder="Fiyat (₺)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min={0} />
            <Input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Sıralama (küçük = önce)" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />

            {/* Features */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Özellikler</p>
              <div className="flex gap-2 mb-2">
                <Input placeholder="Özellik ekle" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFeature()} maxLength={100} />
                <Button size="sm" variant="outline" onClick={addFeature}><Plus className="h-4 w-4" /></Button>
              </div>
              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.features.map((f, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {f}
                      <XCircle className="h-3 w-3 cursor-pointer" onClick={() => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) })} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Multi-image upload with drag reorder */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Ürün Görselleri (sürükle bırak ile sırala)</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-3"
              />
              {uploading && <p className="text-xs text-primary animate-pulse">Görseller yükleniyor...</p>}
              {form.image_urls.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {form.image_urls.map((url, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`relative group w-24 h-24 rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${dragIdx === idx ? "border-primary scale-105 opacity-70" : "border-border hover:border-primary/50"}`}
                    >
                      <img src={url} alt={`Görsel ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <GripVertical className="h-4 w-4 text-white" />
                        <button onClick={() => removeImage(idx)} className="p-1 rounded-full bg-destructive/80 hover:bg-destructive">
                          <XCircle className="h-3 w-3 text-white" />
                        </button>
                      </div>
                      <span className="absolute bottom-0.5 left-1 text-[10px] text-white bg-black/60 px-1 rounded">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary" />
              Aktif (sitede görünsün)
            </label>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>İptal</Button>
              <Button onClick={handleSave} disabled={uploading}>
                {uploading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product list */}
      <div className="space-y-3">
        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Henüz ürün eklenmedi</p>
        )}
        {products.map((p) => (
          <Card key={p.id} className={`border-border/50 ${!p.is_active ? "opacity-50" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {p.image_urls && p.image_urls.length > 0 ? (
                  <div className="flex gap-1 shrink-0">
                    <img src={p.image_urls[0]} alt={p.name} className="w-16 h-16 object-cover rounded-lg" />
                    {p.image_urls.length > 1 && (
                      <div className="w-8 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-medium">+{p.image_urls.length - 1}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{p.name}</span>
                    {p.category && <Badge variant="secondary" className="text-xs">{p.category}</Badge>}
                    {!p.is_active && <Badge variant="outline" className="text-xs">Pasif</Badge>}
                  </div>
                  {p.description && <p className="text-xs text-muted-foreground mt-1 truncate">{p.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {p.price != null && <span>{p.price.toLocaleString("tr-TR")} ₺</span>}
                    <span>Sıra: {p.sort_order}</span>
                    <span><Image className="inline h-3 w-3" /> {p.image_urls?.length || 0}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
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
        ))}
      </div>
    </div>
  );
};

export default ProductManager;
