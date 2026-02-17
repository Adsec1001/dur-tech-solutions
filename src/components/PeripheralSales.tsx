import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SystemBuilder from "@/components/SystemBuilder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import imgMouse from "@/assets/peripheral-mouse.jpg";
import imgKeyboard from "@/assets/peripheral-keyboard.jpg";
import imgHeadset from "@/assets/peripheral-headset.jpg";
import imgMonitor from "@/assets/peripheral-monitor.jpg";
import imgPrinter from "@/assets/peripheral-printer.jpg";
import imgWebcam from "@/assets/peripheral-webcam.jpg";
import imgSpeaker from "@/assets/peripheral-speaker.jpg";
import imgMicrophone from "@/assets/peripheral-microphone.jpg";

const PeripheralSales = () => {
  const peripherals = [
    { name: "Gaming Mouse", category: "Mouse", features: ["RGB Aydınlatma", "Programlanabilir Tuşlar", "Yüksek DPI"], price: "500 ₺'den başlayan", image: imgMouse },
    { name: "Mekanik Klavye", category: "Klavye", features: ["Mekanik Switch", "RGB Aydınlatma", "Anti-Ghosting"], price: "800 ₺'den başlayan", image: imgKeyboard },
    { name: "Gaming Kulaklık", category: "Kulaklık", features: ["7.1 Surround", "Mikrofon", "Konforlu Tasarım"], price: "600 ₺'den başlayan", image: imgHeadset },
    { name: "Monitör", category: "Monitör", features: ["144Hz+", "IPS/VA Panel", "Düşük Tepki Süresi"], price: "3.000 ₺'den başlayan", image: imgMonitor },
    { name: "Yazıcı & Tarayıcı", category: "Yazıcı", features: ["Lazer/Mürekkep", "WiFi Bağlantı", "Çok Fonksiyonlu"], price: "2.000 ₺'den başlayan", image: imgPrinter },
    { name: "Webcam", category: "Kamera", features: ["1080p/4K", "Otomatik Odak", "Mikrofon Dahil"], price: "400 ₺'den başlayan", image: imgWebcam },
    { name: "Hoparlör", category: "Ses", features: ["2.1 Sistem", "Bluetooth", "RGB Aydınlatma"], price: "700 ₺'den başlayan", image: imgSpeaker },
    { name: "Mikrofon", category: "Ses", features: ["USB Bağlantı", "Kardiyoid Patern", "Pop Filtre Dahil"], price: "800 ₺'den başlayan", image: imgMicrophone },
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Çevre Ekipman Satışı</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Gaming ve ofis ihtiyaçlarınız için kaliteli çevre birimleri</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {peripherals.map((item, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 animate-scale-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <div className="h-48 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
              </div>
              <CardHeader className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={getCategoryColor(item.category)}>{item.category}</Badge>
                </div>
                <CardTitle className="text-xl">{item.name}</CardTitle>
                <p className="text-xl font-bold text-primary mt-2">{item.price}</p>
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
          ))}
        </div>

        <SystemBuilder />
      </div>
    </section>
  );
};

export default PeripheralSales;
