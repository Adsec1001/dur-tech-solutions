import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BellRing, Plus, Trash2, Pencil, Save, X, Check, Wrench, Cctv,
  AlarmClock, Search, CheckCircle2, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatSchedule, downloadAlarm } from "@/lib/scheduleUtils";

type LinkedJob = { type: "service" | "camera"; id: string; label: string };

interface Reminder {
  id: string;
  title: string;
  note: string;
  priority: "normal" | "yuksek";
  remindAt?: string;
  isDone: boolean;
  linkedJobs: LinkedJob[];
  createdAt: string;
}

type JobOption = LinkedJob & { status: string };

const rowToReminder = (r: any): Reminder => ({
  id: r.id,
  title: r.title,
  note: r.note || "",
  priority: (r.priority as any) || "normal",
  remindAt: r.remind_at || undefined,
  isDone: !!r.is_done,
  linkedJobs: Array.isArray(r.linked_jobs) ? r.linked_jobs : [],
  createdAt: r.created_at,
});

const emptyForm = () => ({
  title: "",
  note: "",
  priority: "normal" as "normal" | "yuksek",
  remindAt: "",
  linkedJobs: [] as LinkedJob[],
});

const RemindersManager = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [jobSearch, setJobSearch] = useState("");
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    const [rem, svc, cam] = await Promise.all([
      supabase.from("reminders").select("*").order("is_done", { ascending: true }).order("created_at", { ascending: false }),
      supabase.from("service_jobs").select("id, customer_name, customer_surname, device_name, status").neq("status", "completed"),
      supabase.from("camera_jobs").select("id, customer_name, job_type, status").neq("status", "tamamlandi"),
    ]);
    if (rem.data) setReminders(rem.data.map(rowToReminder));
    const opts: JobOption[] = [
      ...(svc.data || []).map((j: any) => ({
        type: "service" as const,
        id: j.id,
        label: `${j.customer_name} ${j.customer_surname}${j.device_name ? ` • ${j.device_name}` : ""}`,
        status: j.status,
      })),
      ...(cam.data || []).map((j: any) => ({
        type: "camera" as const,
        id: j.id,
        label: `${j.customer_name}${j.job_type ? ` • ${j.job_type.replace(/_/g, " ")}` : ""}`,
        status: j.status,
      })),
    ];
    setJobOptions(opts);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm(emptyForm()); setEditingId(null); setShowForm(false); setJobSearch(""); };

  const toggleJob = (opt: JobOption) => {
    setForm((f) => {
      const exists = f.linkedJobs.some((l) => l.id === opt.id && l.type === opt.type);
      return {
        ...f,
        linkedJobs: exists
          ? f.linkedJobs.filter((l) => !(l.id === opt.id && l.type === opt.type))
          : [...f.linkedJobs, { type: opt.type, id: opt.id, label: opt.label }],
      };
    });
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Başlık gerekli", description: "Hatırlatma başlığını yazın.", variant: "destructive" });
      return;
    }
    const payload = {
      title: form.title.trim(),
      note: form.note,
      priority: form.priority,
      remind_at: form.remindAt ? new Date(form.remindAt).toISOString() : null,
      linked_jobs: JSON.parse(JSON.stringify(form.linkedJobs)),
    };
    const { error } = editingId
      ? await supabase.from("reminders").update(payload).eq("id", editingId)
      : await supabase.from("reminders").insert(payload);
    if (error) {
      toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Hatırlatma güncellendi" : "Hatırlatma eklendi" });
    resetForm();
    load();
  };

  const startEdit = (r: Reminder) => {
    setEditingId(r.id);
    setShowForm(true);
    setForm({
      title: r.title,
      note: r.note,
      priority: r.priority,
      remindAt: r.remindAt ? new Date(r.remindAt).toISOString().slice(0, 16) : "",
      linkedJobs: r.linkedJobs,
    });
  };

  const toggleDone = async (r: Reminder) => {
    await supabase.from("reminders").update({ is_done: !r.isDone, done_at: r.isDone ? null : new Date().toISOString() }).eq("id", r.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Bu hatırlatmayı silmek istiyor musunuz?")) return;
    await supabase.from("reminders").delete().eq("id", id);
    load();
  };

  const filteredOptions = jobOptions.filter((o) => o.label.toLowerCase().includes(jobSearch.toLowerCase()));
  const active = reminders.filter((r) => !r.isDone);
  const done = reminders.filter((r) => r.isDone);
  const list = showDone ? done : active;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellRing className="h-5 w-5 text-primary" />
            Hatırlatmalar
            {active.length > 0 && <Badge variant="secondary">{active.length} bekliyor</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={showDone ? "default" : "outline"} onClick={() => setShowDone((v) => !v)}>
              {showDone ? <Clock className="h-4 w-4 mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              {showDone ? "Bekleyenler" : `Tamamlananlar (${done.length})`}
            </Button>
            <Button size="sm" onClick={() => { setShowForm((v) => !v); setEditingId(null); setForm(emptyForm()); }}>
              <Plus className="h-4 w-4 mr-1" /> Yeni Hatırlatma
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {showForm && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Başlık</label>
                <Input
                  placeholder="Örn: Kamera için fiyat alınacak"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Hatırlatma günü / saati (opsiyonel)</label>
                <Input
                  type="datetime-local"
                  value={form.remindAt}
                  onChange={(e) => setForm({ ...form, remindAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Not</label>
              <Textarea
                rows={3}
                placeholder="Detay: eksik malzeme, alınacak fiyat, aranacak tedarikçi..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Önem:</span>
              {(["normal", "yuksek"] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={form.priority === p ? "default" : "outline"}
                  onClick={() => setForm({ ...form, priority: p })}
                >
                  {p === "normal" ? "Normal" : "Acil"}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  İlgili işler ({form.linkedJobs.length} seçili)
                </label>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="pl-7 h-8 text-xs"
                    placeholder="İş ara"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-md border border-border divide-y divide-border">
                {filteredOptions.length === 0 && (
                  <p className="p-3 text-xs text-muted-foreground">Devam eden iş bulunamadı.</p>
                )}
                {filteredOptions.map((opt) => {
                  const checked = form.linkedJobs.some((l) => l.id === opt.id && l.type === opt.type);
                  return (
                    <label
                      key={`${opt.type}-${opt.id}`}
                      className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleJob(opt)} />
                      {opt.type === "service"
                        ? <Wrench className="h-3.5 w-3.5 text-primary shrink-0" />
                        : <Cctv className="h-3.5 w-3.5 text-orange-400 shrink-0" />}
                      <span className="text-sm text-foreground truncate">{opt.label}</span>
                      <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                        {opt.type === "service" ? "Teknik Servis" : "Kamera"}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={save}>
                <Save className="h-4 w-4 mr-1" /> {editingId ? "Güncelle" : "Kaydet"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-1" /> İptal
              </Button>
            </div>
          </div>
        )}

        {list.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            {showDone ? "Tamamlanmış hatırlatma yok." : "Bekleyen hatırlatma yok. Yeni bir not ekleyebilirsiniz."}
          </p>
        )}

        <div className="space-y-3">
          {list.map((r) => (
            <div
              key={r.id}
              className={`rounded-lg border p-4 space-y-3 ${
                r.isDone
                  ? "border-border bg-muted/30 opacity-70"
                  : r.priority === "yuksek"
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleDone(r)}
                  className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                    r.isDone ? "bg-green-500/20 border-green-500/50 text-green-400" : "border-border text-muted-foreground"
                  }`}
                  title={r.isDone ? "Bekliyor yap" : "Tamamlandı yap"}
                >
                  {r.isDone && <Check className="h-3 w-3" />}
                </button>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground break-words">{r.title}</p>
                    {r.priority === "yuksek" && !r.isDone && <Badge variant="destructive" className="text-[10px]">Acil</Badge>}
                  </div>
                  {r.note && <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{r.note}</p>}
                  {r.remindAt && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-primary">
                      <AlarmClock className="h-3.5 w-3.5" />
                      <span>{formatSchedule(r.remindAt)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => downloadAlarm(r.remindAt!, r.title, r.note)}
                      >
                        Alarm kur
                      </Button>
                    </div>
                  )}
                  {r.linkedJobs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {r.linkedJobs.map((l) => (
                        <Badge
                          key={`${l.type}-${l.id}`}
                          variant="outline"
                          className={`text-[10px] gap-1 ${l.type === "service" ? "border-primary/40 text-primary" : "border-orange-400/40 text-orange-400"}`}
                        >
                          {l.type === "service" ? <Wrench className="h-3 w-3" /> : <Cctv className="h-3 w-3" />}
                          {l.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RemindersManager;
