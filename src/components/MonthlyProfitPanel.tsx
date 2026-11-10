import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, TrendingUp, TrendingDown, Wallet, Wrench, Cctv, ShoppingCart, Receipt, Package, Eye, EyeOff, LineChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getJobs } from "@/lib/jobStorage";
import { ServiceJob } from "@/types/serviceJob";
import { useToast } from "@/hooks/use-toast";

// Same PIN as admin panel — obfuscated
const _k = [97, 69, 50, 57, 55, 87, 64, 52, 74, 49, 35].map(c => String.fromCharCode(c)).join("");
const hashPin = async (pin: string): Promise<string> => {
  const enc = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};
let targetHash: string | null = null;
(async () => { targetHash = await hashPin(_k); })();

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const MonthlyProfitPanel = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("profit_unlocked") === "1");
  const [pin, setPin] = useState("");
  const [hideAmounts, setHideAmounts] = useState(() => sessionStorage.getItem("profit_hidden") === "1");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [camJobs, setCamJobs] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const [j, cam, sal, exp] = await Promise.all([
      getJobs(),
      (supabase as any).from("camera_jobs").select("*"),
      (supabase as any).from("product_sales").select("*"),
      (supabase as any).from("expenses").select("*"),
    ]);
    setJobs(j || []);
    setCamJobs(cam.data || []);
    setSales(sal.data || []);
    setExpenses(exp.data || []);
  }, []);

  useEffect(() => { if (unlocked) load(); }, [unlocked, load]);

  const tryUnlock = async () => {
    const h = await hashPin(pin);
    if (h === targetHash) {
      sessionStorage.setItem("profit_unlocked", "1");
      setUnlocked(true);
      setPin("");
    } else {
      toast({ title: "Hatalı şifre", variant: "destructive" });
      setPin("");
    }
  };

  const toggleHide = () => {
    const next = !hideAmounts;
    setHideAmounts(next);
    sessionStorage.setItem("profit_hidden", next ? "1" : "0");
  };

  const fmt = (v: number) => hideAmounts ? "•••" : `${v.toLocaleString("tr-TR")}₺`;

  if (!unlocked) {
    return (
      <Card className="border-primary/30">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Kâr & Gider Paneli</h3>
          </div>
          <p className="text-xs text-muted-foreground">Bu panel şifre ile korunmaktadır.</p>
          <div className="flex gap-2">
            <Input type="password" placeholder="Şifre" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && tryUnlock()} />
            <Button onClick={tryUnlock}>Aç</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter by selected month
  const inMonth = (iso: string | null | undefined) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === year && d.getMonth() === month;
  };

  const mJobs = jobs.filter(j => inMonth(j.createdAt));
  const mCam = camJobs.filter(j => inMonth(j.created_at));
  const mSales = sales.filter(s => inMonth(s.sale_date));
  const mExp = expenses.filter(e => inMonth(e.expense_date));

  const svcRevenue = mJobs.reduce((s, j) => s + (j.fee || 0), 0);
  const svcPaid = mJobs.reduce((s, j) => s + (j.paidAmount || 0), 0);
  const svcMaterial = mJobs.reduce((s, j) => s + (j.materialCost || 0), 0);
  const svcNet = svcPaid - svcMaterial;

  const camRevenue = mCam.reduce((s, j) => s + (Number(j.fee) || 0), 0);
  const camPaid = mCam.reduce((s, j) => s + (Number(j.paid_amount) || 0), 0);
  const camMaterial = mCam.reduce((s, j) => s + (Number(j.material_cost) || 0), 0);
  const camNet = camPaid - camMaterial;

  const salesRevenue = mSales.reduce((s, x) => s + (Number(x.sale_price) || 0), 0);

  const totalExpenses = mExp.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const totalRevenue = svcPaid + camPaid + salesRevenue; // fiili tahsilat
  const totalInvoiced = svcRevenue + camRevenue + salesRevenue;
  const totalMaterial = svcMaterial + camMaterial;
  const totalPending = (svcRevenue - svcPaid) + (camRevenue - camPaid);
  const netProfit = totalRevenue - totalMaterial - totalExpenses;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Expenses by category
  const expByCat: Record<string, number> = {};
  mExp.forEach(e => { expByCat[e.category || "diger"] = (expByCat[e.category || "diger"] || 0) + Number(e.amount || 0); });

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Kâr & Gider — Aylık Rapor</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={toggleHide}>
              {hideAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { sessionStorage.removeItem("profit_unlocked"); setUnlocked(false); }}>
              <Lock className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Year + Month selector */}
        <div className="space-y-2">
          <div className="flex gap-2">
            {years.map(y => (
              <Button key={y} size="sm" variant={y === year ? "default" : "outline"} onClick={() => setYear(y)}>{y}</Button>
            ))}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1">
            {MONTHS.map((m, i) => (
              <Button key={m} size="sm" variant={i === month ? "default" : "outline"} onClick={() => setMonth(i)} className="text-[11px] px-1">
                {m.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><TrendingUp className="h-3 w-3" /> Toplam Tahsilat</div>
            <p className="text-lg font-bold text-green-400">{fmt(totalRevenue)}</p>
          </div>
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Wallet className="h-3 w-3" /> Bekleyen</div>
            <p className="text-lg font-bold text-orange-400">{fmt(totalPending)}</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><TrendingDown className="h-3 w-3" /> Malzeme + Gider</div>
            <p className="text-lg font-bold text-red-400">{fmt(totalMaterial + totalExpenses)}</p>
          </div>
          <div className={`rounded-lg border p-3 ${netProfit >= 0 ? "border-primary/40 bg-primary/10" : "border-red-500/40 bg-red-500/10"}`}>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">Net Kâr</div>
            <p className={`text-lg font-bold ${netProfit >= 0 ? "text-primary" : "text-red-400"}`}>{fmt(netProfit)}</p>
            <p className="text-[10px] text-muted-foreground">Marj: {hideAmounts ? "•••" : `%${margin.toFixed(1)}`}</p>
          </div>
        </div>

        {/* Breakdown by source */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gelir Kaynakları</p>
          <div className="space-y-2">
            <SourceRow icon={<Wrench className="h-4 w-4" />} label="Teknik Servis" count={mJobs.length}
              invoiced={svcRevenue} paid={svcPaid} material={svcMaterial} net={svcNet} fmt={fmt} />
            <SourceRow icon={<Cctv className="h-4 w-4" />} label="Kamera İşleri" count={mCam.length}
              invoiced={camRevenue} paid={camPaid} material={camMaterial} net={camNet} fmt={fmt} />
            <SourceRow icon={<ShoppingCart className="h-4 w-4" />} label="Ürün Satışları" count={mSales.length}
              invoiced={salesRevenue} paid={salesRevenue} material={0} net={salesRevenue} fmt={fmt} />
          </div>
        </div>

        {/* Expenses breakdown */}
        {mExp.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Giderler (Kategoriye Göre)</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(expByCat).map(([cat, amt]) => (
                <Badge key={cat} variant="outline" className="text-xs border-red-500/30 bg-red-500/5 text-red-400">
                  {cat}: {fmt(amt)}
                </Badge>
              ))}
              <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/40">Toplam: {fmt(totalExpenses)}</Badge>
            </div>
          </div>
        )}

        {/* Final calculation */}
        <div className="rounded-lg bg-muted/30 p-3 space-y-1 text-xs">
          <p className="font-semibold text-foreground mb-1">Hesaplama Detayı</p>
          <div className="flex justify-between"><span>Servis tahsilat</span><span className="text-green-400">+{fmt(svcPaid)}</span></div>
          <div className="flex justify-between"><span>Kamera tahsilat</span><span className="text-green-400">+{fmt(camPaid)}</span></div>
          <div className="flex justify-between"><span>Ürün satışı</span><span className="text-green-400">+{fmt(salesRevenue)}</span></div>
          <div className="flex justify-between border-t border-border/50 pt-1"><span>Servis malzeme gideri</span><span className="text-red-400">−{fmt(svcMaterial)}</span></div>
          <div className="flex justify-between"><span>Kamera malzeme gideri</span><span className="text-red-400">−{fmt(camMaterial)}</span></div>
          <div className="flex justify-between"><span>Genel giderler</span><span className="text-red-400">−{fmt(totalExpenses)}</span></div>
          <div className="flex justify-between border-t border-border pt-1 font-bold">
            <span>Net Kâr</span>
            <span className={netProfit >= 0 ? "text-primary" : "text-red-400"}>{fmt(netProfit)}</span>
          </div>
        </div>

        {mJobs.length + mCam.length + mSales.length + mExp.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-2">Bu ay için kayıt bulunmuyor</p>
        )}
      </CardContent>
    </Card>
  );
};

const SourceRow = ({ icon, label, count, invoiced, paid, material, net, fmt }: any) => (
  <div className="rounded-lg border border-border/50 p-2.5">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">{icon} {label}
        <Badge variant="outline" className="text-[10px]">{count} kayıt</Badge>
      </div>
      <span className={`text-sm font-bold ${net >= 0 ? "text-primary" : "text-red-400"}`}>{fmt(net)}</span>
    </div>
    <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground">
      <span>Toplam: <span className="text-foreground">{fmt(invoiced)}</span></span>
      <span>Tahsil: <span className="text-green-400">{fmt(paid)}</span></span>
      <span>Malzeme: <span className="text-red-400">{fmt(material)}</span></span>
    </div>
  </div>
);

export default MonthlyProfitPanel;
