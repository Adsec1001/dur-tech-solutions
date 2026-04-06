import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Save, X, Receipt, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  notes: string;
  expense_date: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "genel", label: "Genel" },
  { value: "dukkan", label: "Dükkan Alışverişi" },
  { value: "malzeme", label: "Malzeme/Parça" },
  { value: "fatura", label: "Fatura" },
  { value: "kira", label: "Kira" },
  { value: "ulasim", label: "Ulaşım" },
  { value: "diger", label: "Diğer" },
];

const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

const ExpenseManager = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ description: "", amount: "", category: "genel", notes: "", expense_date: new Date().toISOString().split("T")[0] });
  const { toast } = useToast();

  const fetchExpenses = useCallback(async () => {
    const { data } = await (supabase as any).from("expenses").select("*").order("expense_date", { ascending: false });
    if (data) setExpenses(data);
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const resetForm = () => {
    setForm({ description: "", amount: "", category: "genel", notes: "", expense_date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.description.trim()) {
      toast({ title: "Açıklama zorunludur", variant: "destructive" });
      return;
    }
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast({ title: "Geçerli bir tutar giriniz", variant: "destructive" });
      return;
    }

    const payload = {
      description: form.description.trim(),
      amount,
      category: form.category,
      notes: form.notes.trim(),
      expense_date: new Date(form.expense_date).toISOString(),
    };

    if (editingId) {
      await (supabase as any).from("expenses").update(payload).eq("id", editingId);
      toast({ title: "Gider güncellendi!" });
    } else {
      await (supabase as any).from("expenses").insert(payload);
      toast({ title: "Gider eklendi!" });
    }
    resetForm();
    fetchExpenses();
  };

  const startEdit = (e: Expense) => {
    setEditingId(e.id);
    setForm({
      description: e.description,
      amount: String(e.amount),
      category: e.category,
      notes: e.notes || "",
      expense_date: new Date(e.expense_date).toISOString().split("T")[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("expenses").delete().eq("id", id);
    toast({ title: "Gider silindi" });
    fetchExpenses();
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // Group by month
  const grouped = expenses.reduce((acc: Record<string, Expense[]>, e) => {
    const month = new Date(e.expense_date).toLocaleDateString("tr-TR", { year: "numeric", month: "long" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-red-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-[11px] text-muted-foreground font-medium">Toplam Gider</span>
            </div>
            <p className="text-lg font-bold text-red-400">{totalExpenses.toLocaleString("tr-TR")}₺</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">Kayıt Sayısı</span>
            </div>
            <p className="text-lg font-bold text-foreground">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add button */}
      <Button onClick={() => { resetForm(); setShowForm(true); }} className="w-full" variant={showForm ? "secondary" : "default"}>
        {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
        {showForm ? "İptal" : "Yeni Gider Ekle"}
      </Button>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Açıklama *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input type="number" placeholder="Tutar (₺) *" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <Input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} />
            <Textarea placeholder="Notlar (isteğe bağlı)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-1" /> {editingId ? "Güncelle" : "Kaydet"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Expense list grouped by month */}
      {Object.entries(grouped).map(([month, items]) => (
        <div key={month}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">{month}</h3>
            <span className="text-xs text-red-400 font-medium">{items.reduce((s, e) => s + e.amount, 0).toLocaleString("tr-TR")}₺</span>
          </div>
          <div className="space-y-2">
            {items.map(e => (
              <Card key={e.id} className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground truncate">{e.description}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">{getCategoryLabel(e.category)}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-bold text-red-400">{e.amount.toLocaleString("tr-TR")}₺</span>
                        <span>{new Date(e.expense_date).toLocaleDateString("tr-TR")}</span>
                      </div>
                      {e.notes && <p className="text-xs text-muted-foreground mt-1">{e.notes}</p>}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(e)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {expenses.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">Henüz gider kaydı yok</p>
      )}
    </div>
  );
};

export default ExpenseManager;
