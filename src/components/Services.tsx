import { Camera, Key, Download, Wrench, Smartphone, BookOpen, Laptop, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import serviceSecurity from "@/assets/service-security.jpg";
import serviceWindows from "@/assets/service-windows.jpg";
import serviceSoftware from "@/assets/service-software.jpg";
import serviceRepair from "@/assets/service-repair.jpg";
import serviceMobile from "@/assets/service-mobile.jpg";
import serviceEducation from "@/assets/service-education.jpg";
import serviceRemote from "@/assets/service-remote.jpg";
import serviceTechSupport from "@/assets/service-techsupport.jpg";

const Services = () => {
  const services = [
    {
      icon: Camera,
      title: "Güvenlik Sistemleri",
      description: "Kamera sistemleri ve alarm sistemleri ile işletmenizi ve evinizi koruyun.",
      image: serviceSecurity,
      features: ["IP Kamera Kurulumu", "Alarm Sistemleri", "Kamera Bakım & Onarım", "DVR/NVR Kurulumu"]
    },
    {
      icon: Key,
      title: "Windows Lisansları",
      description: "Orijinal Windows işletim sistemi ve Office lisansları uygun fiyatlarla.",
      image: serviceWindows,
      features: ["Windows 10/11 Pro", "Office 365", "Windows Server", "Toplu Lisanslama"]
    },
    {
      icon: Download,
      title: "Program & Oyun Kurulumu",
      description: "Profesyonel yazılım ve oyun kurulum hizmetleri ile sisteminizi optimize edin.",
      image: serviceSoftware,
      features: ["Oyun Kurulumu", "Profesyonel Yazılımlar", "Sistem Optimizasyonu", "Sürücü Kurulumu"]
    },
    {
      icon: Wrench,
      title: "Tamir & Bakım Hizmetleri",
      description: "Bilgisayar, PlayStation ve cep telefonu tamir, bakım ve format işlemleri.",
      image: serviceRepair,
      features: ["Bilgisayar Tamiri", "PlayStation Bakım", "Format İşlemleri", "Cep Telefonu Tamiri"]
    },
    {
      icon: Smartphone,
      title: "Yazılım & Mobil Hizmetler",
      description: "Cep telefonu yazılım yükleme, iCloud ve FRP bypass işlemleri.",
      image: serviceMobile,
      features: ["Yazılım Güncelleme", "iCloud Bypass", "FRP Bypass", "Mobil Sorun Çözümleri"]
    },
    {
      icon: BookOpen,
      title: "Eğitim Hizmetleri",
      description: "Bilgisayar ve ağ sistemleri konusunda profesyonel eğitimler.",
      image: serviceEducation,
      features: ["Bilgisayar Eğitimi", "Ağ Eğitimi", "Sistem Yönetimi", "Güvenlik Eğitimi"]
    },
    {
      icon: Laptop,
      title: "Uzaktan Destek",
      description: "İnternet üzerinden hızlı ve güvenli teknik destek hizmeti.",
      image: serviceRemote,
      features: ["Uzak Bağlantı", "Anında Müdahale", "Sorun Çözümü", "Sistem Optimizasyonu"]
    },
    {
      icon: Settings,
      title: "Teknik Destek",
      description: "Yerinde ve uzaktan teknik destek hizmeti ile her zaman yanınızdayız.",
      image: serviceTechSupport,
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

          <div className="mt-8 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-2">Freelance Uzaktan Destek</h3>
            <p className="text-muted-foreground text-sm mb-5">
              Bilgisayar tamiri, yazılım kurulumu, sistem optimizasyonu ve teknik destek gibi tüm hizmetlerimizi uzaktan bağlantı ile hızlı ve güvenli şekilde sunuyoruz.
            </p>
            <h4 className="text-base font-medium text-foreground mb-3">İletişime Geçebileceğiniz Platformlar</h4>
            <div className="flex items-center justify-center gap-6">
              <a href="https://www.fiverr.com/adsec_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#1DBF73]" xmlns="http://www.w3.org/2000/svg"><path d="M21.999 7.549h-3.271c0-2.744-1.851-3.063-2.857-3.063-1.24 0-2.122.679-2.122 1.93 0 1.358.849 1.766 2.449 2.467l1.104.476c2.449 1.057 3.894 2.186 3.894 4.798 0 3.16-2.282 4.841-5.374 4.841-3.482 0-5.673-1.68-5.928-4.918h3.304c.136 1.358 1.037 2.147 2.636 2.147 1.37 0 2.225-.713 2.225-1.866 0-1.253-.815-1.723-2.639-2.535l-1.078-.463C12.006 10.282 10.7 9.047 10.7 6.64c0-2.81 2.186-4.659 5.168-4.659 3.271 0 6.131 1.53 6.131 5.568zM5.765 7.549H3.509V18h3.27V7.549h2.968V4.853h-2.968V3.22c0-.866.326-1.182 1.179-1.182h1.789V0H8.051c-2.28 0-3.29 1.075-3.29 3.166v1.687H3.03v2.696h1.731V18h-3.27V7.549H0v-2.696h1.497V3.166C1.497.73 3.137 0 5.765 0h3.062v4.853H5.765v2.696z"/></svg>
                <span className="text-sm font-medium">Fiverr</span>
              </a>
              <a href="https://bionluk.com/adsec" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                <svg viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="#FF6B35"/><text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">B</text></svg>
                <span className="text-sm font-medium">Bionluk</span>
              </a>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/10 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
              <CardHeader className="pt-3 pb-2">
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
