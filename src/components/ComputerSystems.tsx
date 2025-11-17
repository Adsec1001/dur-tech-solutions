import { Cpu, Monitor, Zap, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ComputerSystems = () => {
  const systems = [
    {
      name: "Ofis Bilgisayarı",
      category: "Ofis",
      processor: "Intel Core i5 12400",
      ram: "16GB DDR4",
      storage: "512GB NVMe SSD",
      price: "15.000 ₺",
      features: ["Windows 11 Pro", "Office Hazır", "Sessiz Çalışma"]
    },
    {
      name: "Gaming PC - Orta Seviye",
      category: "Oyun",
      processor: "Intel Core i5 13600K",
      ram: "32GB DDR5",
      storage: "1TB NVMe + RTX 4060 Ti",
      price: "35.000 ₺",
      features: ["RGB Kasa", "Sıvı Soğutma", "1080p/144fps"]
    },
    {
      name: "Gaming PC - Üst Seviye",
      category: "Oyun",
      processor: "Intel Core i7 14700K",
      ram: "32GB DDR5",
      storage: "2TB NVMe + RTX 4070 Ti",
      price: "55.000 ₺",
      features: ["Premium Kasa", "AIO Soğutma", "4K/120fps"]
    },
    {
      name: "İş İstasyonu",
      category: "Profesyonel",
      processor: "Intel Core i9 14900K",
      ram: "64GB DDR5",
      storage: "2TB NVMe + Quadro",
      price: "75.000 ₺",
      features: ["Workstation GPU", "ECC RAM", "Render Gücü"]
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Ofis": return "default";
      case "Oyun": return "destructive";
      case "Profesyonel": return "secondary";
      default: return "default";
    }
  };

  return (
    <section id="systems" className="py-20">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Hazır Bilgisayar Sistemleri
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            İhtiyacınıza uygun, özenle hazırlanmış bilgisayar sistemleri
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systems.map((system, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'both' }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={getCategoryColor(system.category)}>{system.category}</Badge>
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">{system.name}</CardTitle>
                <CardDescription className="text-2xl font-bold text-primary mt-2">
                  {system.price}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{system.processor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{system.ram}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{system.storage}</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <ul className="space-y-1">
                    {system.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full hover:scale-105 transition-transform duration-300">İncele</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComputerSystems;
