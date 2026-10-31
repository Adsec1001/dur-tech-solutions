import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, DatabaseBackup, FileBarChart } from "lucide-react";
import { exportReportPdf, type ReportData } from "@/lib/reportPdf";
import { fileStamp } from "@/lib/fileStamp";

// Order matters for restore (parents before children with foreign keys)
const TABLES = [
  "products",
  "materials",
  "service_jobs",
  "camera_jobs",
  "security_products",
  "expenses",
  "reminders",
  "product_sales",
  "material_movements",
  "shopping_list",
  "computer_sales",
] as const;

const BackupManager = () => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportBackup = async () => {
    setBusy(true);
    try {
      const data: Record<string, unknown[]> = {};
      for (const t of TABLES) {
        const all: unknown[] = [];
        for (let from = 0; ; from += 1000) {
          const { data: rows, error } = await supabase.from(t).select("*").setHeader("Cache-Control", "no-store").range(from, from + 999);
          if (error) throw new Error(`${t}: ${error.message}`);
          all.push(...(rows || []));
          if (!rows || rows.length < 1000) break;
        }
        data[t] = all;
      }
      const backup = { app: "durbilisim", version: 1, created_at: new Date().toISOString(), tables: data };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `durbilisim_yedek_${fileStamp()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      const total = Object.values(data).reduce((s, r) => s + r.length, 0);
      toast({ title: "Yedek indirildi", description: `${total} kayıt yedeklendi.` });
    } catch (e) {
      toast({ title: "Yedek alınamadı", description: String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const exportReport = async () => {
    setBusy(true);
    try {
      const keys = ["service_jobs", "camera_jobs", "product_sales", "computer_sales", "expenses"] as const;
      const data: Record<string, any[]> = {};
      for (const t of keys) {
        const all: any[] = [];
        for (let from = 0; ; from += 1000) {
          const { data: rows, error } = await supabase.from(t).select("*").setHeader("Cache-Control", "no-store").range(from, from + 999);
          if (error) throw new Error(`${t}: ${error.message}`);
          all.push(...(rows || []));
          if (!rows || rows.length < 1000) break;
        }
        data[t] = all;
      }
      await exportReportPdf(data as unknown as ReportData);
      toast({ title: "Rapor indirildi" });
    } catch (e) {
      toast({ title: "Rapor oluşturulamadı", description: String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const importBackup = async (file: File) => {
    if (!confirm("Yedekteki kayıtlar geri yüklenecek. Aynı kayıtlar yedekteki haliyle güncellenir. Devam edilsin mi?")) return;
    setBusy(true);
    try {
      const json = JSON.parse(await file.text());
      if (!json?.tables) throw new Error("Geçersiz yedek dosyası");
      let total = 0;
      for (const t of TABLES) {
        const rows = json.tables[t] as Record<string, unknown>[] | undefined;
        if (!rows?.length) continue;
        for (let i = 0; i < rows.length; i += 500) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await supabase.from(t).upsert(rows.slice(i, i + 500) as any);
          if (error) throw new Error(`${t}: ${error.message}`);
        }
        total += rows.length;
      }
      toast({ title: "Geri yükleme tamamlandı", description: `${total} kayıt yüklendi. Sayfayı yenileyin.` });
    } catch (e) {
      toast({ title: "Geri yükleme başarısız", description: String(e), variant: "destructive" });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <DatabaseBackup className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Yedekleme</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Tüm işler, ürünler, malzemeler, giderler, satışlar ve hatırlatmalar tek dosya olarak indirilir.
        Bu dosyayla verileri istediğiniz zaman geri yükleyebilirsiniz.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={exportBackup} disabled={busy}>
          <Download className="h-4 w-4 mr-2" /> Yedek Al
        </Button>
        <Button variant="secondary" onClick={exportReport} disabled={busy}>
          <FileBarChart className="h-4 w-4 mr-2" /> Grafikli PDF Rapor
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Upload className="h-4 w-4 mr-2" /> Yedekten Geri Yükle
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])}
        />
      </div>
      <p className="text-xs text-muted-foreground">Not: Ürün görselleri bağlantı olarak yedeklenir.</p>
    </div>
  );
};

export default BackupManager;
