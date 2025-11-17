import { Shield, Key, Download, Headphones } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      icon: Shield,
      title: "Güvenlik Sistemleri",
      description: "Kamera sistemleri, alarm sistemleri ve ağ güvenliği çözümleri ile işletmenizi koruyun.",
      features: ["IP Kamera Kurulumu", "Alarm Sistemleri", "Ağ Güvenliği", "Siber Güvenlik Danışmanlığı"]
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
      icon: Headphones,
      title: "Teknik Destek",
      description: "7/24 teknik destek hizmeti ile her zaman yanınızdayız.",
      features: ["Uzaktan Destek", "Yerinde Teknik Servis", "Periyodik Bakım", "Acil Müdahale"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Hizmetlerimiz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bilişim sektöründe kapsamlı çözümler sunuyoruz
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
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
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
