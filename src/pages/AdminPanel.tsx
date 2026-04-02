import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Check, ArrowRight, ChevronDown, ChevronUp,
  Clipboard, CalendarClock, CheckCircle2, XCircle, LogOut, Pencil, Save, X, Package, Wrench, Cctv
} from "lucide-react";
import ProductManager from "@/components/ProductManager";
import CameraJobManager from "@/components/CameraJobManager";
import AdminNotifications from "@/components/AdminNotifications";
import { ServiceJob, ServiceType, JobStatus, JobStep, Accessory } from "@/types/serviceJob";
import { getJobs, addJob, updateJob, deleteJob, generateTrackingCode, formatPhone } from "@/lib/jobStorage";
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

// Admin authentication key — obfuscated
const _k = [97, 69, 50, 57, 55, 87, 64, 52, 74, 49, 35].map(c => String.fromCharCode(c)).join("");

const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

let resolvedHash: string | null = null;
(async () => {
  resolvedHash = await hashPin(_k);
})();

const AdminPanel = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceJob>>({});
  const [editAccessories, setEditAccessories] = useState<Accessory[]>([]);
  const [newEditAccessory, setNewEditAccessory] = useState("");
  const [newStepText, setNewStepText] = useState<Record<string, string>>({});
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"jobs" | "products" | "camera">("jobs");
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerName: "",
    customerSurname: "",
    customerPhone: "",
    serviceType: "device" as ServiceType,
    deviceName: "",
    fee: "",
    notes: "",
    rustdeskId: "",
  });
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [newAccessory, setNewAccessory] = useState("");

  const refreshJobs = useCallback(async () => {
    const data = await getJobs();
    setJobs(data);
    return data;
  }, []);

  useEffect(() => {
    if (authenticated) {
      refreshJobs().then(async (jobList) => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        let needsUpdate = false;
        const updated = jobList.map((j) => {
          if (j.status === "postponed" && j.postponedTo) {
            const postponedTime = new Date(j.postponedTo).getTime();
            if (postponedTime <= todayStart) {
              needsUpdate = true;
              return { ...j, status: "pending" as JobStatus, postponedTo: undefined };
            }
          }
          return j;
        });
        if (needsUpdate) {
          for (const job of updated) {
            await updateJob(job);
          }
          setJobs(updated);
        }
      });
    }
  }, [authenticated, refreshJobs]);

  const handleLogin = async () => {
    const inputHash = await hashPin(pin);
    if (inputHash === resolvedHash) {
      setAuthenticated(true);
      sessionStorage.setItem("db_admin", "1");
    } else {
      toast({ title: "Hatalı PIN", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("db_admin") === "1") setAuthenticated(true);
  }, []);

  const handleAddJob = async () => {
    if (!form.customerName.trim() || !form.customerSurname.trim()) {
      toast({ title: "Ad ve soyad zorunludur", variant: "destructive" });
      return;
    }
    const phoneDigits = form.customerPhone.replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length !== 11) {
      toast({ title: "Telefon numarası 11 haneli olmalıdır", variant: "destructive" });
      return;
    }
    const job: ServiceJob = {
      id: crypto.randomUUID(),
      trackingCode: generateTrackingCode(),
      customerName: form.customerName.trim(),
      customerSurname: form.customerSurname.trim(),
      customerPhone: phoneDigits,
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
    await addJob(job);
    await refreshJobs();
    setForm({ customerName: "", customerSurname: "", customerPhone: "", serviceType: "device", deviceName: "", fee: "", notes: "", rustdeskId: "" });
    setAccessories([]);
    setShowForm(false);
    toast({ title: `İş eklendi! Takip Kodu: ${job.trackingCode}` });
  };

  const handleAddAccessory = () => {
    if (!newAccessory.trim()) return;
    setAccessories([...accessories, { id: crypto.randomUUID(), name: newAccessory.trim() }]);
    setNewAccessory("");
  };

  const startEditing = (job: ServiceJob) => {
    setEditingJob(job.id);
    setEditForm({
      customerName: job.customerName,
      customerSurname: job.customerSurname,
      customerPhone: job.customerPhone,
      serviceType: job.serviceType,
      deviceName: job.deviceName,
      fee: job.fee,
      notes: job.notes,
      completionNotes: job.completionNotes,
      status: job.status,
    });
    setEditAccessories([...job.accessories]);
    setNewEditAccessory("");
    setExpandedJob(job.id);
  };

  const cancelEditing = () => {
    setEditingJob(null);
    setEditForm({});
    setEditAccessories([]);
  };

  const handleSaveEdit = async (job: ServiceJob) => {
    if (!editForm.customerName?.trim() || !editForm.customerSurname?.trim()) {
      toast({ title: "Ad ve soyad zorunludur", variant: "destructive" });
      return;
    }
    const phoneDigits = (editForm.customerPhone || "").replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length !== 11) {
      toast({ title: "Telefon numarası 11 haneli olmalıdır", variant: "destructive" });
      return;
    }
    const updated: ServiceJob = {
      ...job,
      customerName: editForm.customerName?.trim() || job.customerName,
      customerSurname: editForm.customerSurname?.trim() || job.customerSurname,
      customerPhone: phoneDigits,
      serviceType: (editForm.serviceType as ServiceType) || job.serviceType,
      deviceName: editForm.deviceName?.trim() || "",
      accessories: editAccessories,
      fee: Number(editForm.fee) || 0,
      notes: editForm.notes?.trim() || "",
      completionNotes: editForm.completionNotes?.trim() || "",
      status: (editForm.status as JobStatus) || job.status,
    };
    if (editForm.status === "postponed" && job.status !== "postponed") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updated.postponedTo = tomorrow.toISOString();
    }
    if (editForm.status !== "postponed") {
      updated.postponedTo = undefined;
    }
    if (editForm.status === "completed" && job.status !== "completed") {
      updated.completedAt = new Date().toISOString();
    }
    await updateJob(updated);
    await refreshJobs();
    setEditingJob(null);
    setEditForm({});
    toast({ title: "Değişiklikler kaydedildi!" });
  };

  const handleAddEditAccessory = () => {
    if (!newEditAccessory.trim()) return;
    setEditAccessories([...editAccessories, { id: crypto.randomUUID(), name: newEditAccessory.trim() }]);
    setNewEditAccessory("");
  };

  const handleStatusChange = async (job: ServiceJob, status: JobStatus) => {
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
    await updateJob(updated);
    await refreshJobs();
  };

  const handleAddStep = async (job: ServiceJob) => {
    const text = newStepText[job.id]?.trim();
    if (!text) return;
    const step: JobStep = {
      id: crypto.randomUUID(),
      description: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...job, steps: [...job.steps, step] };
    await updateJob(updated);
    await refreshJobs();
    setNewStepText({ ...newStepText, [job.id]: "" });
  };

  const toggleStep = async (job: ServiceJob, stepId: string) => {
    const updated = {
      ...job,
      steps: job.steps.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString() : undefined } : s
      ),
    };
    await updateJob(updated);
    await refreshJobs();
  };

  const handleDelete = async (id: string) => {
    await deleteJob(id);
    await refreshJobs();
    if (editingJob === id) cancelEditing();
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
              maxLength={20}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Paneli</h1>
            <p className="text-sm text-muted-foreground">İş takibi ve ürün yönetimi</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { sessionStorage.removeItem("db_admin"); setAuthenticated(false); }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <AdminNotifications />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeTab === "jobs"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Wrench className="h-4 w-4" /> Teknik Servis
          </button>
          <button
            onClick={() => setActiveTab("camera")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeTab === "camera"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Cctv className="h-4 w-4" /> Kamera İşleri
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeTab === "products"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Package className="h-4 w-4" /> Ürünler
          </button>
        </div>

        {activeTab === "products" && <ProductManager />}
        {activeTab === "camera" && <CameraJobManager />}

        {activeTab === "jobs" && (
        <>
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
            <Plus className="h-4 w-4" /> Yeni İş
          </Button>
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
              <Input
                placeholder="Telefon Numarası (05XX XXX XX XX)"
                value={form.customerPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                  setForm({ ...form, customerPhone: val });
                }}
                maxLength={11}
                inputMode="numeric"
              />

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

              {form.serviceType === "remote" && (
                <Input placeholder="RustDesk ID" value={form.rustdeskId} onChange={(e) => setForm({ ...form, rustdeskId: e.target.value })} maxLength={50} />
              )}

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
            const isEditing = editingJob === job.id;
            return (
              <Card key={job.id} className={`border-border/50 transition-all ${job.status === "postponed" ? "border-orange-500/30" : ""}`}>
                <CardContent className="p-4">
                  {/* Summary row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0" onClick={() => { if (!isEditing) setExpandedJob(isExpanded ? null : job.id); }} style={{ cursor: isEditing ? "default" : "pointer" }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-foreground">{job.customerName} {job.customerSurname}</span>
                        <Badge className={STATUS_COLORS[job.status]}>{STATUS_LABELS[job.status]}</Badge>
                        {job.status === "postponed" && (
                          <span className="text-xs text-orange-400 font-medium">📌 Yarın yapılacak</span>
                        )}
                      </div>
                      {job.customerPhone && (
                        <p className="text-xs text-muted-foreground mb-1">📞 {formatPhone(job.customerPhone)}</p>
                      )}
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
                      {!isEditing && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEditing(job)}>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Edit Mode */}
                  {isExpanded && isEditing && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Ad *" value={editForm.customerName || ""} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} maxLength={50} />
                        <Input placeholder="Soyad *" value={editForm.customerSurname || ""} onChange={(e) => setEditForm({ ...editForm, customerSurname: e.target.value })} maxLength={50} />
                      </div>
                      <Input
                        placeholder="Telefon (05XX XXX XX XX)"
                        value={editForm.customerPhone || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                          setEditForm({ ...editForm, customerPhone: val });
                        }}
                        maxLength={11}
                        inputMode="numeric"
                      />

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Hizmet Türü</p>
                        <div className="flex gap-2 flex-wrap">
                          {(["remote", "freelance", "device"] as ServiceType[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => setEditForm({ ...editForm, serviceType: t })}
                              className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                editForm.serviceType === t
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
                              }`}
                            >
                              {SERVICE_LABELS[t]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {editForm.serviceType === "device" && (
                        <>
                          <Input placeholder="Cihaz Adı / Modeli" value={editForm.deviceName || ""} onChange={(e) => setEditForm({ ...editForm, deviceName: e.target.value })} maxLength={100} />
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Aksesuarlar</p>
                            <div className="flex gap-2 mb-2">
                              <Input placeholder="Aksesuar ekle" value={newEditAccessory} onChange={(e) => setNewEditAccessory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddEditAccessory()} maxLength={50} />
                              <Button size="sm" variant="outline" onClick={handleAddEditAccessory}><Plus className="h-4 w-4" /></Button>
                            </div>
                            {editAccessories.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {editAccessories.map((a) => (
                                  <Badge key={a.id} variant="secondary" className="gap-1">
                                    {a.name}
                                    <XCircle className="h-3 w-3 cursor-pointer" onClick={() => setEditAccessories(editAccessories.filter((x) => x.id !== a.id))} />
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      <Input type="number" placeholder="Ücret (₺)" value={editForm.fee ?? ""} onChange={(e) => setEditForm({ ...editForm, fee: parseFloat(e.target.value) || 0 })} min={0} />
                      <Textarea placeholder="Notlar" value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} maxLength={500} rows={2} />

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Durum</p>
                        <div className="flex gap-2 flex-wrap">
                          {(["pending", "in_progress", "completed", "postponed"] as JobStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => setEditForm({ ...editForm, status: s })}
                              className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                editForm.status === s
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
                              }`}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Textarea
                        placeholder="Yapılan işlem notu"
                        value={editForm.completionNotes || ""}
                        onChange={(e) => setEditForm({ ...editForm, completionNotes: e.target.value })}
                        rows={2}
                        className="text-sm"
                        maxLength={500}
                      />

                      {/* Steps — still editable in edit mode */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">İşlem Adımları</p>
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

                      <div className="flex gap-2 justify-end pt-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={cancelEditing}>
                          <X className="h-3 w-3" /> İptal
                        </Button>
                        <Button size="sm" className="gap-1" onClick={() => handleSaveEdit(job)}>
                          <Save className="h-3 w-3" /> Kaydet
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Normal expanded details (non-edit mode) */}
                  {isExpanded && !isEditing && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-fade-in">
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

                      {job.notes && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notlar</p>
                          <p className="text-sm text-foreground/80">{job.notes}</p>
                        </div>
                      )}

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
        </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
