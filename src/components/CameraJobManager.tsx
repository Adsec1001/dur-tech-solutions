import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Cctv, Check, ChevronDown, ChevronUp, Save, X, CalendarClock, CheckCircle2, Banknote, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type CameraJobType = "ariza" | "kamera_ekleme" | "sifir_kurulum" | "bakim" | "montaj" | "malzeme_satis" | "diger";
type CameraJobStatus = "bekliyor" | "devam_ediyor" | "tamamlandi" | "ertelendi";

const JOB_TYPE_LABELS: Record<CameraJobType, string> = {
  ariza: "Arıza",
  kamera_ekleme: "Kamera Ekleme",
  sifir_kurulum: "Sıfır Kurulum",
  bakim: "Bakım",
  montaj: "Montaj",
  malzeme_satis: "Malzeme Satış",
  diger: "Diğer",
};

const STATUS_LABELS: Record<CameraJobStatus, string> = {
  bekliyor: "Bekliyor",
  devam_ediyor: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
  ertelendi: "Yarına Ertelendi",
};

const STATUS_COLORS: Record<CameraJobStatus, string> = {
  bekliyor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  devam_ediyor: "bg-primary/20 text-primary border-primary/30",
  tamamlandi: "bg-green-500/20 text-green-400 border-green-500/30",
  ertelendi: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

interface CameraJob {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  address: string | null;
  job_type: CameraJobType;
  camera_count: number;
  dvr_model: string | null;
  notes: string | null;
  checklist: Record<string, boolean>;
  status: CameraJobStatus;
  fee: number | null;
  paid_amount: number | null;
  created_at: string;
  completed_at: string | null;
  postponed_to: string | null;
  promised_payment_date: string | null;
}

const DEFAULT_CHECKLIST: Record<string, string> = {
  kablo_cekimi: "Kablo çekimi",
  kamera_montaj: "Kamera montajı",
  dvr_kurulum: "DVR/NVR kurulumu",
  hdd_takildi: "HDD takıldı",
  telefon_erisim: "Telefon erişimi ayarlandı",
  test_edildi: "Test edildi",
  musteri_bilgilendirildi: "Müşteri bilgilendirildi",
};

const emptyForm = {
  customer_name: "",
  customer_phone: "",
  address: "",
  job_type: "sifir_kurulum" as CameraJobType,
  camera_count: 0,
  dvr_model: "",
  notes: "",
  fee: "",
  paid_amount: "",
  status: "bekliyor" as CameraJobStatus,
  checklist: Object.keys(DEFAULT_CHECKLIST).reduce((acc, k) => ({ ...acc, [k]: false }), {} as Record<string, boolean>),
  promised_payment_date: "",
};

const CameraJobManager = () => {
  const [jobs, setJobs] = useState<CameraJob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<CameraJobStatus | "all">("all");
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("camera_jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setJobs(data as CameraJob[]);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.customer_name.trim()) {
      toast({ title: "Müşteri adı zorunludur", variant: "destructive" });
      return;
    }
    const payload = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim() || null,
      address: form.address.trim() || null,
      job_type: form.job_type,
      camera_count: form.camera_count,
      dvr_model: form.dvr_model.trim() || null,
      notes: form.notes.trim() || null,
      fee: parseFloat(form.fee) || null,
      paid_amount: parseFloat(form.paid_amount) || 0,
      status: form.status,
      checklist: form.checklist,
      promised_payment_date: form.promised_payment_date || null,
    };

    if (editingId) {
      await (supabase as any).from("camera_jobs").update(payload).eq("id", editingId);
      toast({ title: "İş güncellendi!" });
    } else {
      await (supabase as any).from("camera_jobs").insert(payload);
      toast({ title: "Kamera işi eklendi!" });
    }
    resetForm();
    await fetchJobs();
  };

  const startEdit = (j: CameraJob) => {
    setEditingId(j.id);
    setForm({
      customer_name: j.customer_name,
      customer_phone: j.customer_phone || "",
      address: j.address || "",
      job_type: j.job_type,
      camera_count: j.camera_count,
      dvr_model: j.dvr_model || "",
      notes: j.notes || "",
      fee: j.fee?.toString() || "",
      paid_amount: j.paid_amount?.toString() || "0",
      status: j.status,
      checklist: j.checklist || emptyForm.checklist,
      promised_payment_date: j.promised_payment_date ? j.promised_payment_date.slice(0, 10) : "",
    });
    setShowForm(true);
    setExpandedId(null);
  };

  const toggleChecklist = async (job: CameraJob, key: string) => {
    const updated = { ...job.checklist, [key]: !job.checklist[key] };
    await (supabase as any).from("camera_jobs").update({ checklist: updated }).eq("id", job.id);
    await fetchJobs();
  };

  const handleMarkPaid = async (job: CameraJob) => {
    await (supabase as any).from("camera_jobs").update({ paid_amount: job.fee }).eq("id", job.id);
    toast({ title: "Ödeme tamamlandı olarak işaretlendi!" });
    await fetchJobs();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("camera_jobs").delete().eq("id", id);
    toast({ title: "İş silindi" });
    await fetchJobs();
  };

  const handleStatusChange = async (job: CameraJob, status: CameraJobStatus) => {
    const update: Record<string, unknown> = { status };
    if (status === "tamamlandi") update.completed_at = new Date().toISOString();
    if (status === "ertelendi") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      update.postponed_to = tomorrow.toISOString();
    }
    if (status !== "ertelendi") update.postponed_to = null;
    await (supabase as any).from("camera_jobs").update(update).eq("id", job.id);
    await fetchJobs();
  };

  const filtered = filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Kamera İşleri</h2>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-1">
          <Plus className="h-4 w-4" /> Yeni İş
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "İşi Düzenle" : "Yeni Kamera İşi"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Müşteri Adı *" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} maxLength={100} />
            <Input placeholder="Telefon" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 11) })} maxLength={11} inputMode="numeric" />
            <Input placeholder="Adres" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} maxLength={200} />

            <div>
              <p className="text-xs text-muted-foreground mb-1">📷 İş Tipi</p>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(JOB_TYPE_LABELS) as CameraJobType[]).map(t => (
                  <button key={t} onClick={() => setForm({ ...form, job_type: t })}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${form.job_type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {JOB_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">📹 Kamera Sayısı</p>
                <Input type="number" value={form.camera_count} onChange={e => setForm({ ...form, camera_count: parseInt(e.target.value) || 0 })} min={0} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">💰 Ücret (₺)</p>
                <Input type="number" placeholder="Ücret" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} min={0} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">💳 Ödenen (₺)</p>
                <Input type="number" placeholder="Ödenen tutar" value={form.paid_amount} onChange={e => setForm({ ...form, paid_amount: e.target.value })} min={0} />
              </div>
            </div>

            <Input placeholder="DVR/NVR Modeli" value={form.dvr_model} onChange={e => setForm({ ...form, dvr_model: e.target.value })} maxLength={100} />
            <Textarea placeholder="Notlar (detaylar, hatırlatmalar...)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={500} rows={3} />

            {editingId && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Durum</p>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(STATUS_LABELS) as CameraJobStatus[]).map(s => (
                    <button key={s} onClick={() => setForm({ ...form, status: s })}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${form.status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-2">✅ Kontrol Listesi</p>
              <div className="space-y-2">
                {Object.entries(DEFAULT_CHECKLIST).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={form.checklist[key] || false}
                      onChange={e => setForm({ ...form, checklist: { ...form.checklist, [key]: e.target.checked } })}
                      className="accent-primary" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>İptal</Button>
              <Button onClick={handleSave}>{editingId ? "Güncelle" : "Kaydet"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera Jobs Revenue Dashboard */}
      {(() => {
        const camTotal = jobs.reduce((s, j) => s + (j.fee || 0), 0);
        const camPaid = jobs.reduce((s, j) => s + (j.paid_amount || 0), 0);
        const camRemaining = camTotal - camPaid;
        const unpaidCount = jobs.filter(j => (j.fee || 0) > 0 && (j.paid_amount || 0) < (j.fee || 0)).length;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-[11px] text-muted-foreground font-medium">Kamera Geliri</span>
                </div>
                <p className="text-lg font-bold text-foreground">{camTotal.toLocaleString("tr-TR")}₺</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="h-4 w-4 text-green-400" />
                  <span className="text-[11px] text-muted-foreground font-medium">Tahsil Edilen</span>
                </div>
                <p className="text-lg font-bold text-green-400">{camPaid.toLocaleString("tr-TR")}₺</p>
              </CardContent>
            </Card>
            <Card className="border-red-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-[11px] text-muted-foreground font-medium">Bekleyen</span>
                </div>
                <p className="text-lg font-bold text-red-400">{camRemaining.toLocaleString("tr-TR")}₺</p>
              </CardContent>
            </Card>
            <Card className="border-orange-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-orange-400" />
                  <span className="text-[11px] text-muted-foreground font-medium">Ödenmemiş İş</span>
                </div>
                <p className="text-lg font-bold text-orange-400">{unpaidCount} adet</p>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "bekliyor", "devam_ediyor", "tamamlandi", "ertelendi"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            {s === "all" ? "Tümü" : STATUS_LABELS[s]} ({s === "all" ? jobs.length : jobs.filter(j => j.status === s).length})
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Henüz kamera işi eklenmedi</p>}
        {filtered.map(job => {
          const isExpanded = expandedId === job.id;
          const checkDone = Object.values(job.checklist || {}).filter(Boolean).length;
          const checkTotal = Object.keys(DEFAULT_CHECKLIST).length;
          return (
            <Card key={job.id} className={`border-border/50 ${job.status === "ertelendi" ? "border-orange-500/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : job.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Cctv className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{job.customer_name}</span>
                      <Badge className={STATUS_COLORS[job.status]}>{STATUS_LABELS[job.status]}</Badge>
                      <Badge variant="secondary" className="text-xs">{JOB_TYPE_LABELS[job.job_type]}</Badge>
                      {job.status === "ertelendi" && <span className="text-xs text-orange-400 font-medium">📌 Yarın yapılacak</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>📹 {job.camera_count} kamera</span>
                      {job.dvr_model && <span>• {job.dvr_model}</span>}
                      {job.fee != null && <span>• {job.fee}₺</span>}
                      <span>• ✅ {checkDone}/{checkTotal}</span>
                    </div>
                    {job.fee != null && job.fee > 0 && (
                      <div className="mt-1">
                        {(job.paid_amount || 0) >= job.fee ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[11px]">✓ Ödendi</Badge>
                        ) : (job.paid_amount || 0) > 0 ? (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[11px]">
                            Kısmi ödeme: {job.paid_amount}₺ — Kalan: {job.fee - (job.paid_amount || 0)}₺
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[11px]">Ödenmedi — {job.fee}₺</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={e => { e.stopPropagation(); startEdit(job); }}>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-fade-in">
                    {job.customer_phone && <p className="text-xs text-muted-foreground">📞 {job.customer_phone}</p>}
                    {job.address && <p className="text-xs text-muted-foreground">📍 {job.address}</p>}
                    {job.notes && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notlar</p>
                        <p className="text-sm text-foreground/80">{job.notes}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Kontrol Listesi</p>
                      <div className="space-y-1.5">
                        {Object.entries(DEFAULT_CHECKLIST).map(([key, label]) => (
                          <div key={key} className="flex items-center gap-2">
                            <button onClick={() => toggleChecklist(job, key)}
                              className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-all ${job.checklist?.[key] ? "bg-green-500/20 border-green-500/50 text-green-400" : "border-border hover:border-primary/50"}`}>
                              {job.checklist?.[key] && <Check className="h-3 w-3" />}
                            </button>
                            <span className={`text-sm ${job.checklist?.[key] ? "line-through text-muted-foreground" : "text-foreground"}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {job.fee != null && job.fee > 0 && (job.paid_amount || 0) < job.fee && (
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-red-500/30 bg-red-500/5">
                        <Banknote className="h-4 w-4 text-red-400 shrink-0" />
                        <span className="text-xs text-red-400 font-medium flex-1">
                          {(job.paid_amount || 0) > 0
                            ? `Kalan: ${(job.fee - (job.paid_amount || 0)).toLocaleString("tr-TR")}₺`
                            : `Ödenmedi: ${job.fee.toLocaleString("tr-TR")}₺`}
                        </span>
                        <Button size="sm" className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700" onClick={() => handleMarkPaid(job)}>
                          <CheckCircle2 className="h-3 w-3" /> Ödendi İşaretle
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.status === "bekliyor" && (
                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleStatusChange(job, "devam_ediyor")}>
                          İşleme Al
                        </Button>
                      )}
                      {job.status !== "tamamlandi" && (
                        <Button size="sm" className="gap-1 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(job, "tamamlandi")}>
                          Tamamla
                        </Button>
                      )}
                      {job.status !== "tamamlandi" && job.status !== "ertelendi" && (
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-orange-400 border-orange-500/30 hover:bg-orange-500/10" onClick={() => handleStatusChange(job, "ertelendi")}>
                          <CalendarClock className="h-3 w-3" /> Yarına Ertele
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="h-3 w-3" /> Sil
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">Oluşturulma: {new Date(job.created_at).toLocaleString("tr-TR")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CameraJobManager;
