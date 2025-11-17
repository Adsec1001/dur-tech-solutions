import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Telefon",
      content: "+90 (555) 123 45 67",
      link: "tel:+905551234567"
    },
    {
      icon: Mail,
      title: "E-posta",
      content: "info@durbilisim.com",
      link: "mailto:info@durbilisim.com"
    },
    {
      icon: MapPin,
      title: "Adres",
      content: "Merkez Mahallesi, Teknoloji Caddesi No:42",
      link: "#"
    },
    {
      icon: Clock,
      title: "Çalışma Saatleri",
      content: "Pazartesi - Cumartesi: 09:00 - 18:00",
      link: "#"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            İletişim
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sorularınız için bize ulaşın, size yardımcı olmaktan mutluluk duyarız
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                  {info.link.startsWith('#') ? (
                    <p className="text-sm text-muted-foreground">{info.content}</p>
                  ) : (
                    <a 
                      href={info.link}
                      className="text-sm text-primary hover:underline"
                    >
                      {info.content}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;
