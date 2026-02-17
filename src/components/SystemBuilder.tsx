import { useState, useRef } from "react";
import { Cpu, Monitor, Laptop, ChevronRight, FileDown, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const pdfRef = useRef<HTMLDivElement>(null);

  const selectedSystem = systemTypes.find((s) => s.id === systemType);
  const selectedForm = formFactors.find((f) => f.id === formFactor);

  const generatePDF = async () => {
    if (!pdfRef.current || !selectedSystem || !selectedForm) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Dur_Bilisim_Sistem_Talebi.pdf");
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

      {/* Step 1 */}
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

      {/* Step 2 */}
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
        <>
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

          {/* Hidden PDF template */}
          <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <div
              ref={pdfRef}
              style={{
                width: "794px",
                padding: "48px",
                backgroundColor: "#ffffff",
                fontFamily: "Arial, Helvetica, sans-serif",
                color: "#1a1a1a",
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "32px", borderBottom: "3px solid #0ea5e9", paddingBottom: "24px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0", color: "#0ea5e9" }}>
                  Dur Bilişim
                </h1>
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>Hazır Sistem Bilgisayar Talep Formu</p>
              </div>

              {/* Info rows */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "12px 16px", backgroundColor: "#f0f9ff", border: "1px solid #e0e0e0", fontWeight: "bold", width: "40%", fontSize: "14px" }}>
                      Sistem Tipi
                    </td>
                    <td style={{ padding: "12px 16px", border: "1px solid #e0e0e0", fontSize: "14px" }}>
                      {selectedSystem?.icon} {selectedSystem?.label}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 16px", backgroundColor: "#f0f9ff", border: "1px solid #e0e0e0", fontWeight: "bold", fontSize: "14px" }}>
                      Açıklama
                    </td>
                    <td style={{ padding: "12px 16px", border: "1px solid #e0e0e0", fontSize: "14px" }}>
                      {selectedSystem?.desc}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 16px", backgroundColor: "#f0f9ff", border: "1px solid #e0e0e0", fontWeight: "bold", fontSize: "14px" }}>
                      Form Faktörü
                    </td>
                    <td style={{ padding: "12px 16px", border: "1px solid #e0e0e0", fontSize: "14px" }}>
                      {selectedForm?.label}
                    </td>
                  </tr>
                  {note.trim() && (
                    <tr>
                      <td style={{ padding: "12px 16px", backgroundColor: "#f0f9ff", border: "1px solid #e0e0e0", fontWeight: "bold", fontSize: "14px", verticalAlign: "top" }}>
                        Not
                      </td>
                      <td style={{ padding: "12px 16px", border: "1px solid #e0e0e0", fontSize: "14px", whiteSpace: "pre-wrap" }}>
                        {note}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Contact info */}
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "20px", marginTop: "32px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px", color: "#0ea5e9" }}>
                  Bu formu aşağıdaki kanallardan bize iletebilirsiniz:
                </h3>
                <p style={{ fontSize: "13px", margin: "6px 0", color: "#333" }}>📸 Instagram: @durbilisim</p>
                <p style={{ fontSize: "13px", margin: "6px 0", color: "#333" }}>📧 E-posta: durbilisimguvenlik@gmail.com</p>
                <p style={{ fontSize: "13px", margin: "6px 0", color: "#333" }}>📞 Telefon: +90 539 778 40 00 / +90 539 442 54 33</p>
              </div>

              {/* Footer */}
              <div style={{ textAlign: "center", marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #e0e0e0" }}>
                <p style={{ fontSize: "11px", color: "#999" }}>© Dur Bilişim — durbilisim.lovable.app</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemBuilder;
