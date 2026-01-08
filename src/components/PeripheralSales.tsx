import { Mouse, Keyboard, Headphones, Monitor, Printer, Camera, Speaker, Mic, Cpu } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PeripheralSales = () => {
  const peripherals = [
    {
      name: "Gaming Mouse",
      category: "Mouse",
      features: ["RGB Aydınlatma", "Programlanabilir Tuşlar", "Yüksek DPI"],
      price: "500 ₺'den başlayan",
      icon: Mouse
    },
    {
      name: "Mekanik Klavye",
      category: "Klavye",
      features: ["Mekanik Switch", "RGB Aydınlatma", "Anti-Ghosting"],
      price: "800 ₺'den başlayan",
      icon: Keyboard
    },
    {
      name: "Gaming Kulaklık",
      category: "Kulaklık",
      features: ["7.1 Surround", "Mikrofon", "Konforlu Tasarım"],
      price: "600 ₺'den başlayan",
      icon: Headphones
    },
    {
      name: "Monitör",
      category: "Monitör",
      features: ["144Hz+", "IPS/VA Panel", "Düşük Tepki Süresi"],
      price: "3.000 ₺'den başlayan",
      icon: Monitor
    },
    {
      name: "Yazıcı & Tarayıcı",
      category: "Yazıcı",
      features: ["Lazer/Mürekkep", "WiFi Bağlantı", "Çok Fonksiyonlu"],
      price: "2.000 ₺'den başlayan",
      icon: Printer
    },
    {
      name: "Webcam",
      category: "Kamera",
      features: ["1080p/4K", "Otomatik Odak", "Mikrofon Dahil"],
      price: "400 ₺'den başlayan",
      icon: Camera
    },
    {
      name: "Hoparlör",
      category: "Ses",
      features: ["2.1 Sistem", "Bluetooth", "RGB Aydınlatma"],
      price: "700 ₺'den başlayan",
      icon: Speaker
    },
    {
      name: "Mikrofon",
      category: "Ses",
      features: ["USB Bağlantı", "Kardiyoid Patern", "Pop Filtre Dahil"],
      price: "800 ₺'den başlayan",
      icon: Mic
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Mouse": return "default";
      case "Klavye": return "secondary";
      case "Kulaklık": return "destructive";
      case "Monitör": return "default";
      case "Yazıcı": return "secondary";
      case "Kamera": return "destructive";
      case "Ses": return "default";
      default: return "default";
    }
  };

  return (
    <section id="peripherals" className="py-20">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Çevre Ekipman Satışı
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gaming ve ofis ihtiyaçlarınız için kaliteli çevre birimleri
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {peripherals.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card 
                key={index} 
                className="border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={getCategoryColor(item.category)}>{item.category}</Badge>
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <p className="text-xl font-bold text-primary mt-2">
                    {item.price}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.features.map((feature, idx) => (
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
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-muted/50 border border-border rounded-xl px-8 py-6">
            <Cpu className="h-8 w-8 text-primary" />
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Hazır Sistem Bilgisayarlar
              </h3>
              <p className="text-lg text-muted-foreground mt-1">Yakında...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PeripheralSales;
