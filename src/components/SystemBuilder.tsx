import { useState } from "react";
import { Cpu, Monitor, Laptop, ChevronRight, FileDown, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

type SystemType = "low" | "office" | "gaming" | null;
type FormFactor = "desktop" | "laptop" | null;

const systemTypes = [
  { id: "low" as const, label: "Düşük Sistem", desc: "Günlük kullanım, internet ve ofis", icon: "💻" },
  { id: "office" as const, label: "Ofis Bilgisayarı", desc: "İş uygulamaları ve multitasking", icon: "🖥️" },
  { id: "gaming" as const, label: "Gaming Bilgisayar", desc: "Oyun ve yüksek performans", icon: "🎮" },
];

const formFactors = [
  { id: "desktop" as const, label: "Masaüstü", icon: Monitor },
  { id: "laptop" as const, label: "Laptop", icon: Laptop },
];

const SystemBuilder = () => {
  const [systemType, setSystemType] = useState<SystemType>(null);
  const [formFactor, setFormFactor] = useState<FormFactor>(null);
  const [note, setNote] = useState("");

  const selectedSystem = systemTypes.find((s) => s.id === systemType);
  const selectedForm = formFactors.find((f) => f.id === formFactor);

  const generatePDF = () => {
    if (!selectedSystem || !selectedForm) return;

    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("Dur Bilisim - Hazir Sistem Talebi", pw / 2, 25, { align: "center" });

    doc.setFontSize(12);
    let y = 45;
    doc.text("Sistem Tipi:", 20, y);
    doc.setFont("helvetica", "bold");
    doc.text(selectedSystem.label, 70, y);

    y += 12;
    doc.setFont("helvetica", "normal");
    doc.text("Form Faktoru:", 20, y);
    doc.setFont("helvetica", "bold");
    doc.text(selectedForm.label, 70, y);

    if (note.trim()) {
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.text("Not:", 20, y);
      y += 8;
      const lines = doc.splitTextToSize(note, pw - 40);
      doc.text(lines, 20, y);
      y += lines.length * 7;
    }

    y += 20;
    doc.setDrawColor(100);
    doc.line(20, y, pw - 20, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Bu formu asagidaki kanallardan bize iletebilirsiniz:", 20, y);
    y += 8;
    doc.text("Instagram: @durbilisim", 20, y);
    y += 6;
    doc.text("E-posta: durbilisimguvenlik@gmail.com", 20, y);
    y += 6;
    doc.text("Telefon: +90 539 778 40 00 / +90 539 442 54 33", 20, y);

    doc.save("Dur_Bilisim_Sistem_Talebi.pdf");
  };

  const reset = () => {
    setSystemType(null);
    setFormFactor(null);
    setNote("");
  };

  return (
    <div className="mt-16 max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <Cpu className="h-8 w-8 text-primary" />
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">Hazır Sistem Bilgisayarlar</h3>
        </div>
        <p className="text-muted-foreground">
          İhtiyacınıza uygun sistemi seçin, formu PDF olarak indirip Instagram, e-posta veya telefon ile bize iletin.
        </p>
      </div>

      {/* Step 1: System Type */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">1. Sistem Tipini Seçin</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {systemTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSystemType(t.id); setFormFactor(null); }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                systemType === t.id
                  ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <p className="font-semibold text-foreground mt-2">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Form Factor */}
      {systemType && (
        <div className="mb-6 animate-fade-in">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">2. Masaüstü mü, Laptop mu?</h4>
          <div className="grid grid-cols-2 gap-3">
            {formFactors.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormFactor(f.id)}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-200 ${
                  formFactor === f.id
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <f.icon className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Note */}
      {formFactor && (
        <div className="mb-6 animate-fade-in">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            <StickyNote className="inline h-4 w-4 mr-1" />
            3. Notunuz (Opsiyonel)
          </h4>
          <Textarea
            placeholder="Bütçe, özel istek, marka tercihi vb."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
          />
        </div>
      )}

      {/* Summary & PDF */}
      {systemType && formFactor && (
        <Card className="border-primary/30 bg-primary/5 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span>{selectedSystem?.icon}</span>
                <span className="font-semibold">{selectedSystem?.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{selectedForm?.label}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>Sıfırla</Button>
                <Button size="sm" onClick={generatePDF} className="gap-2">
                  <FileDown className="h-4 w-4" /> PDF İndir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemBuilder;
