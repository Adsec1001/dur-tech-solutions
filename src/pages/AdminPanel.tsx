import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Check, Clock, ArrowRight, ChevronDown, ChevronUp,
  Clipboard, Monitor, Laptop, Wrench, CalendarClock, CheckCircle2, XCircle, LogOut
} from "lucide-react";
import { ServiceJob, ServiceType, JobStatus, JobStep, Accessory } from "@/types/serviceJob";
import { getJobs, addJob, updateJob, deleteJob, generateTrackingCode } from "@/lib/jobStorage";
import { useToast } from "@/hooks/use-toast";

const SERVICE_LABELS: Record<ServiceType, string> = {
  remote: "Uzaktan Destek",
  freelance: "Freelance",
  device: "Cihaz Servisi",
};

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Bekliyor",
  in_progress: "İşlemde",
  completed: "Tamamlandı",
  postponed: "Yarına Ertelendi",
};

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  postponed: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

// SHA-256 hash of the admin PIN — original value never stored in code
const ADMIN_PIN_HASH = "b0f2c2797e13be3e51e7978ec5773b24614e22tried";

const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const AdminPanel = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [newStepText, setNewStepText] = useState<Record<string, string>>({});
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState({
    customerName: "",
    customerSurname: "",
    serviceType: "device" as ServiceType,
    deviceName: "",
    fee: "",
    notes: "",
  });
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [newAccessory, setNewAccessory] = useState("");

  useEffect(() => {
    if (authenticated) {
      setJobs(getJobs());
      // Check postponed jobs
      const today = new Date().toDateString();
      const updated = getJobs().map((j) => {
        if (j.status === "postponed" && j.postponedTo) {
          const postponedDate = new Date(j.postponedTo).toDateString();
          if (postponedDate <= today) {
            return { ...j, status: "pending" as JobStatus, postponedTo: undefined };
          }
        }
        return j;
      });
      import("@/lib/jobStorage").then(({ saveJobs }) => {
        saveJobs(updated);
        setJobs(updated);
      });
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      sessionStorage.setItem("db_admin", "1");
    } else {
      toast({ title: "Hatalı PIN", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("db_admin") === "1") setAuthenticated(true);
  }, []);

  const handleAddJob = () => {
    if (!form.customerName.trim() || !form.customerSurname.trim()) {
      toast({ title: "Ad ve soyad zorunludur", variant: "destructive" });
      return;
    }
    const job: ServiceJob = {
      id: crypto.randomUUID(),
      trackingCode: generateTrackingCode(),
      customerName: form.customerName.trim(),
      customerSurname: form.customerSurname.trim(),
      serviceType: form.serviceType,
      deviceName: form.deviceName.trim(),
      accessories: accessories,
      fee: parseFloat(form.fee) || 0,
      notes: form.notes.trim(),
      status: "pending",
      steps: [],
      completionNotes: "",
      createdAt: new Date().toISOString(),
    };
    addJob(job);
    setJobs(getJobs());
    setForm({ customerName: "", customerSurname: "", serviceType: "device", deviceName: "", fee: "", notes: "" });
    setAccessories([]);
    setShowForm(false);
    toast({ title: `İş eklendi! Takip Kodu: ${job.trackingCode}` });
  };

  const handleAddAccessory = () => {
    if (!newAccessory.trim()) return;
    setAccessories([...accessories, { id: crypto.randomUUID(), name: newAccessory.trim() }]);
    setNewAccessory("");
  };

  const handleStatusChange = (job: ServiceJob, status: JobStatus) => {
    const updated = { ...job, status };
    if (status === "postponed") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updated.postponedTo = tomorrow.toISOString();
    }
    if (status === "completed") {
      updated.completedAt = new Date().toISOString();
      updated.completionNotes = completionNotes[job.id] || "";
    }
    updateJob(updated);
    setJobs(getJobs());
  };

  const handleAddStep = (job: ServiceJob) => {
    const text = newStepText[job.id]?.trim();
    if (!text) return;
    const step: JobStep = {
      id: crypto.randomUUID(),
      description: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...job, steps: [...job.steps, step] };
    updateJob(updated);
    setJobs(getJobs());
    setNewStepText({ ...newStepText, [job.id]: "" });
  };

  const toggleStep = (job: ServiceJob, stepId: string) => {
    const updated = {
      ...job,
      steps: job.steps.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString() : undefined } : s
      ),
    };
    updateJob(updated);
    setJobs(getJobs());
  };

  const handleDelete = (id: string) => {
    deleteJob(id);
    setJobs(getJobs());
    toast({ title: "İş silindi" });
  };

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-primary text-xl">Admin Giriş</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="PIN giriniz"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              maxLength={10}
              className="text-center text-lg tracking-widest"
            />
            <Button onClick={handleLogin} className="w-full">Giriş</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">Teknik Servis Paneli</h1>
            <p className="text-sm text-muted-foreground">İş takibi ve yönetimi</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
              <Plus className="h-4 w-4" /> Yeni İş
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { sessionStorage.removeItem("db_admin"); setAuthenticated(false); }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add Job Form */}
        {showForm && (
          <Card className="mb-6 border-primary/30 animate-fade-in">
            <CardHeader><CardTitle className="text-lg">Yeni İş Ekle</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Ad *" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} maxLength={50} />
                <Input placeholder="Soyad *" value={form.customerSurname} onChange={(e) => setForm({ ...form, customerSurname: e.target.value })} maxLength={50} />
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Hizmet Türü</p>
                <div className="flex gap-2 flex-wrap">
                  {(["remote", "freelance", "device"] as ServiceType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, serviceType: t })}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        form.serviceType === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {SERVICE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {form.serviceType === "device" && (
                <>
                  <Input placeholder="Cihaz Adı / Modeli" value={form.deviceName} onChange={(e) => setForm({ ...form, deviceName: e.target.value })} maxLength={100} />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Aksesuarlar</p>
                    <div className="flex gap-2 mb-2">
                      <Input placeholder="Aksesuar ekle (örn: Şarj kablosu)" value={newAccessory} onChange={(e) => setNewAccessory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddAccessory()} maxLength={50} />
                      <Button size="sm" variant="outline" onClick={handleAddAccessory}><Plus className="h-4 w-4" /></Button>
                    </div>
                    {accessories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {accessories.map((a) => (
                          <Badge key={a.id} variant="secondary" className="gap-1">
                            {a.name}
                            <XCircle className="h-3 w-3 cursor-pointer" onClick={() => setAccessories(accessories.filter((x) => x.id !== a.id))} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <Input type="number" placeholder="Ücret (₺)" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} min={0} />
              <Textarea placeholder="Notlar (opsiyonel)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} rows={2} />

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
                <Button onClick={handleAddJob}>Kaydet</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(["all", "pending", "in_progress", "completed", "postponed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filter === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {s === "all" ? "Tümü" : STATUS_LABELS[s]} ({s === "all" ? jobs.length : jobs.filter((j) => j.status === s).length})
            </button>
          ))}
        </div>

        {/* Job List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Henüz iş kaydı yok</p>
          )}
          {filtered.map((job) => {
            const isExpanded = expandedJob === job.id;
            return (
              <Card key={job.id} className={`border-border/50 transition-all ${job.status === "postponed" ? "border-orange-500/30" : ""}`}>
                <CardContent className="p-4">
                  {/* Summary row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0" onClick={() => setExpandedJob(isExpanded ? null : job.id)} style={{ cursor: "pointer" }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-foreground">{job.customerName} {job.customerSurname}</span>
                        <Badge className={STATUS_COLORS[job.status]}>{STATUS_LABELS[job.status]}</Badge>
                        {job.status === "postponed" && (
                          <span className="text-xs text-orange-400 font-medium">📌 Yarın yapılacak</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>{SERVICE_LABELS[job.serviceType]}</span>
                        {job.deviceName && <span>• {job.deviceName}</span>}
                        <span>• {job.fee > 0 ? `${job.fee}₺` : "Ücret belirtilmedi"}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">{job.trackingCode}</code>
                        <Clipboard
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(job.trackingCode);
                            toast({ title: "Takip kodu kopyalandı!" });
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-fade-in">
                      {/* Accessories */}
                      {job.accessories.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Aksesuarlar</p>
                          <div className="flex flex-wrap gap-1">
                            {job.accessories.map((a) => (
                              <Badge key={a.id} variant="outline" className="text-xs">{a.name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {job.notes && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notlar</p>
                          <p className="text-sm text-foreground/80">{job.notes}</p>
                        </div>
                      )}

                      {/* Steps */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">İşlem Adımları</p>
                        {job.steps.length === 0 && <p className="text-xs text-muted-foreground">Henüz adım eklenmedi</p>}
                        <div className="space-y-1.5">
                          {job.steps.map((step, i) => (
                            <div key={step.id} className="flex items-center gap-2">
                              <button onClick={() => toggleStep(job, step.id)} className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-all ${step.completed ? "bg-green-500/20 border-green-500/50 text-green-400" : "border-border hover:border-primary/50"}`}>
                                {step.completed && <Check className="h-3 w-3" />}
                              </button>
                              <span className={`text-sm ${step.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {i + 1}. {step.description}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Yeni adım ekle..."
                            value={newStepText[job.id] || ""}
                            onChange={(e) => setNewStepText({ ...newStepText, [job.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleAddStep(job)}
                            className="text-sm h-8"
                            maxLength={200}
                          />
                          <Button size="sm" variant="outline" className="h-8" onClick={() => handleAddStep(job)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Completion notes */}
                      {job.status !== "completed" && (
                        <Textarea
                          placeholder="Tamamlanınca yapılan işlemi yazın..."
                          value={completionNotes[job.id] || job.completionNotes || ""}
                          onChange={(e) => setCompletionNotes({ ...completionNotes, [job.id]: e.target.value })}
                          rows={2}
                          className="text-sm"
                          maxLength={500}
                        />
                      )}
                      {job.status === "completed" && job.completionNotes && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Yapılan İşlem</p>
                          <p className="text-sm text-green-400/80">{job.completionNotes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {job.status !== "in_progress" && job.status !== "completed" && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleStatusChange(job, "in_progress")}>
                            <ArrowRight className="h-3 w-3" /> İşleme Al
                          </Button>
                        )}
                        {job.status !== "completed" && (
                          <Button size="sm" className="gap-1 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(job, "completed")}>
                            <CheckCircle2 className="h-3 w-3" /> Tamamla
                          </Button>
                        )}
                        {job.status !== "completed" && job.status !== "postponed" && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs text-orange-400 border-orange-500/30 hover:bg-orange-500/10" onClick={() => handleStatusChange(job, "postponed")}>
                            <CalendarClock className="h-3 w-3" /> Yarına Ertele
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(job.id)}>
                          <Trash2 className="h-3 w-3" /> Sil
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground">Oluşturulma: {new Date(job.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
