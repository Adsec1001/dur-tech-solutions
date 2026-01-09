import { Camera, Key, Download, Wrench, Smartphone, BookOpen, Laptop, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Services = () => {
  const services = [
    {
      icon: Camera,
      title: "Güvenlik Sistemleri",
      description: "Kamera sistemleri ve alarm sistemleri ile işletmenizi ve evinizi koruyun.",
      features: ["IP Kamera Kurulumu", "Alarm Sistemleri", "Kamera Bakım & Onarım", "DVR/NVR Kurulumu"]
    },
    {
      icon: Key,
      title: "Windows Lisansları",
      description: "Orijinal Windows işletim sistemi ve Office lisansları uygun fiyatlarla.",
      features: ["Windows 10/11 Pro", "Office 365", "Windows Server", "Toplu Lisanslama"]
    },
    {
      icon: Download,
      title: "Program & Oyun Kurulumu",
      description: "Profesyonel yazılım ve oyun kurulum hizmetleri ile sisteminizi optimize edin.",
      features: ["Oyun Kurulumu", "Profesyonel Yazılımlar", "Sistem Optimizasyonu", "Sürücü Kurulumu"]
    },
    {
      icon: Wrench,
      title: "Tamir & Bakım Hizmetleri",
      description: "Bilgisayar, PlayStation ve cep telefonu tamir, bakım ve format işlemleri.",
      features: ["Bilgisayar Tamiri", "PlayStation Bakım", "Format İşlemleri", "Cep Telefonu Tamiri"]
    },
    {
      icon: Smartphone,
      title: "Yazılım & Mobil Hizmetler",
      description: "Cep telefonu yazılım yükleme, iCloud ve FRP bypass işlemleri.",
      features: ["Yazılım Güncelleme", "iCloud Bypass", "FRP Bypass", "Mobil Sorun Çözümleri"]
    },
    {
      icon: BookOpen,
      title: "Eğitim Hizmetleri",
      description: "Bilgisayar ve ağ sistemleri konusunda profesyonel eğitimler.",
      features: ["Bilgisayar Eğitimi", "Ağ Eğitimi", "Sistem Yönetimi", "Güvenlik Eğitimi"]
    },
    {
      icon: Laptop,
      title: "Uzaktan Destek",
      description: "İnternet üzerinden hızlı ve güvenli teknik destek hizmeti.",
      features: ["Uzak Bağlantı", "Anında Müdahale", "Sorun Çözümü", "Sistem Optimizasyonu"]
    },
    {
      icon: Settings,
      title: "Teknik Destek",
      description: "Yerinde ve uzaktan teknik destek hizmeti ile her zaman yanınızdayız.",
      features: ["Yerinde Teknik Servis", "Periyodik Bakım", "Acil Müdahale", "7/24 Destek"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Hizmetlerimiz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bilişim sektöründe kapsamlı çözümler sunuyoruz
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/10 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full hover:scale-105 transition-transform duration-300"
                  onClick={() => window.open("https://wa.me/905397784000?text=Merhaba%20bilgi%20almak%20istiyorum.", "_blank")}
                >
                  Bilgi Al
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
