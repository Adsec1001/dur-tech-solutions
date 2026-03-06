import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Check, Clock, ArrowRight, CalendarClock, CheckCircle2 } from "lucide-react";
import { ServiceJob, JobStatus } from "@/types/serviceJob";
import { findByTrackingCode } from "@/lib/jobStorage";

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Bekliyor",
  in_progress: "İşlemde",
  completed: "Tamamlandı",
  postponed: "Ertelendi",
};

const STATUS_ICONS: Record<JobStatus, React.ReactNode> = {
  pending: <Clock className="h-5 w-5" />,
  in_progress: <ArrowRight className="h-5 w-5" />,
  completed: <CheckCircle2 className="h-5 w-5" />,
  postponed: <CalendarClock className="h-5 w-5" />,
};

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: "text-yellow-400",
  in_progress: "text-primary",
  completed: "text-green-400",
  postponed: "text-orange-400",
};

const TrackingSection = () => {
  const [code, setCode] = useState("");
  const [job, setJob] = useState<ServiceJob | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!code.trim()) return;
    const found = findByTrackingCode(code.trim());
    setJob(found || null);
    setSearched(true);
  };

  const completedSteps = job ? job.steps.filter((s) => s.completed).length : 0;
  const totalSteps = job ? job.steps.length : 0;

  return (
    <section id="tracking" className="py-20">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">İşlem Takibi</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Takip kodunuzu girerek işleminizin güncel durumunu öğrenebilirsiniz
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Takip kodu (örn: DB-A2B3C4)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              maxLength={10}
              className="font-mono text-center tracking-wider"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searched && !job && (
            <Card className="border-destructive/30">
              <CardContent className="p-6 text-center">
                <p className="text-destructive">Takip kodu bulunamadı. Lütfen kontrol edip tekrar deneyin.</p>
              </CardContent>
            </Card>
          )}

          {job && (
            <Card className="border-primary/30 animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">İşlem Durumu</CardTitle>
                  <div className={`flex items-center gap-1.5 ${STATUS_COLORS[job.status]}`}>
                    {STATUS_ICONS[job.status]}
                    <span className="font-semibold text-sm">{STATUS_LABELS[job.status]}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Müşteri</p>
                    <p className="font-medium text-foreground">{job.customerName} {job.customerSurname}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Takip Kodu</p>
                    <code className="font-mono text-primary">{job.trackingCode}</code>
                  </div>
                </div>

                {job.deviceName && (
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Cihaz</p>
                    <p className="font-medium text-foreground">{job.deviceName}</p>
                  </div>
                )}

                {totalSteps > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">İlerleme</p>
                      <span className="text-xs text-muted-foreground">{completedSteps}/{totalSteps}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-3">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="space-y-2">
                      {job.steps.map((step, i) => (
                        <div key={step.id} className="flex items-start gap-2">
                          <div className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                            step.completed
                              ? "bg-green-500/20 border-green-500/50 text-green-400"
                              : "border-border text-muted-foreground"
                          }`}>
                            {step.completed ? <Check className="h-3 w-3" /> : <span className="text-[10px]">{i + 1}</span>}
                          </div>
                          <span className={`text-sm ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {step.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalSteps === 0 && job.status !== "completed" && (
                  <p className="text-sm text-muted-foreground text-center py-2">İşlem adımları henüz eklenmedi, lütfen bekleyiniz.</p>
                )}

                {job.status === "completed" && job.completionNotes && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-400 uppercase mb-1">Yapılan İşlem</p>
                    <p className="text-sm text-foreground/80">{job.completionNotes}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Kayıt tarihi: {new Date(job.createdAt).toLocaleString("tr-TR")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrackingSection;
