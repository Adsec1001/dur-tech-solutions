import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", surname: "", phone: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Ad alanı zorunludur";
    if (!form.surname.trim()) errs.surname = "Soyad alanı zorunludur";
    if (!form.phone.trim()) errs.phone = "Telefon alanı zorunludur";
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = "Telefon numarası 10 haneli olmalıdır (başında 0 olmadan)";
    if (!form.note.trim()) errs.note = "Not alanı zorunludur";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const message = `Merhaba, ben ${form.name} ${form.surname}.%0ATelefon: 0${form.phone}%0ANot: ${encodeURIComponent(form.note)}`;
    window.open(`https://wa.me/905397784000?text=${message}`, "_blank");

    toast({ title: "Yönlendiriliyorsunuz", description: "WhatsApp üzerinden mesajınız iletilecektir." });
    setForm({ name: "", surname: "", phone: "", note: "" });
    setErrors({});
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("0")) return;
    if (digits.length <= 10) setForm((f) => ({ ...f, phone: digits }));
  };

  const contactInfo = [
    { icon: Phone, title: "Telefon", content: ["+90 539 778 40 00", "+90 539 442 54 33"], link: ["tel:+905397784000", "tel:+905394425433"] },
    { icon: Mail, title: "E-posta", content: "durbilisimguvenlik@gmail.com", link: "mailto:durbilisimguvenlik@gmail.com" },
    { icon: MapPin, title: "Adres", content: "Yusuf Kılıç, 217. Cd No:63, 33220 Toroslar/Mersin", link: "#" },
    { icon: Clock, title: "Çalışma Saatleri", content: "Pazartesi - Pazar: 08:00 - 19:00", link: "#" },
  ];

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">İletişim</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Sorularınız için bize ulaşın, size yardımcı olmaktan mutluluk duyarız</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                  {Array.isArray(info.content) ? (
                    <div className="flex flex-col gap-1">
                      {info.content.map((item, i) => (
                        <a key={i} href={(info.link as string[])[i]} className="text-sm text-primary hover:underline">{item}</a>
                      ))}
                    </div>
                  ) : typeof info.link === "string" && info.link.startsWith("#") ? (
                    <p className="text-sm text-muted-foreground">{info.content}</p>
                  ) : (
                    <a href={info.link as string} className="text-sm text-primary hover:underline">{info.content}</a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <Card className="max-w-2xl mx-auto border-border">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Bize Ulaşın</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad *</Label>
                  <Input id="name" placeholder="Adınız" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={50} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Soyad *</Label>
                  <Input id="surname" placeholder="Soyadınız" value={form.surname} onChange={(e) => setForm((f) => ({ ...f, surname: e.target.value }))} maxLength={50} />
                  {errors.surname && <p className="text-sm text-destructive">{errors.surname}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon * <span className="text-xs text-muted-foreground">(Başında 0 olmadan, 10 haneli)</span></Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">0</span>
                  <Input id="phone" placeholder="5XX XXX XX XX" value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} maxLength={10} inputMode="numeric" />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Not *</Label>
                <Textarea id="note" placeholder="Mesajınızı yazın..." value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} maxLength={500} rows={4} />
                {errors.note && <p className="text-sm text-destructive">{errors.note}</p>}
              </div>
              <Button type="submit" className="w-full shadow-neon-sm hover:shadow-neon">
                <Send className="h-4 w-4 mr-2" /> WhatsApp ile Gönder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Contact;
