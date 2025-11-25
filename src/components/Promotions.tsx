import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Settings, Download, KeyRound, LockKeyhole, Monitor } from "lucide-react";

const Promotions = () => {
  const promotions = [
    {
      icon: Gamepad2,
      title: "İSTEDİĞİNİZ OYUN KURULUMU",
      gradient: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Settings,
      title: "BİLGİSAYAR BAKIM PERFORMANS VE SİSTEM REHBERLİĞİ",
      gradient: "from-red-500 to-red-700",
      bgColor: "bg-red-50"
    },
    {
      icon: Download,
      title: "İSTEDİĞİNİZ PROGRAM KURULUMU",
      gradient: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: KeyRound,
      title: "KULLANIMA HAZIR PROGRAMLAR",
      gradient: "from-purple-500 to-purple-700",
      bgColor: "bg-purple-50"
    },
    {
      icon: LockKeyhole,
      title: "BİLGİSAYAR VE BIOS ŞİFRESİ SIFIRLAMA",
      gradient: "from-green-500 to-green-700",
      bgColor: "bg-green-50"
    },
    {
      icon: Monitor,
      title: "WIN11-WIN10 LİSANS ve FORMAT",
      gradient: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Özel Hizmetlerimiz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Size özel hazırlanmış profesyonel bilişim çözümleri
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {promotions.map((promo, index) => (
            <Card 
              key={index}
              className={`${promo.bgColor} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in overflow-hidden group cursor-pointer`}
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <CardContent className="p-8 relative">
                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${promo.gradient} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                    <promo.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground leading-tight">
                    {promo.title}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promotions;
