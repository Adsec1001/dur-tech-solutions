import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-tech.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-[600px] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background) / 0.95) 50%, hsl(var(--background) / 0.7) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Teknolojik Çözümleriniz için
            <span className="text-primary block mt-2">Güvenilir Ortak</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Güvenlik sistemlerinden Windows lisanslarına, oyun kurulumlarından teknik desteğe kadar 
            tüm bilişim ihtiyaçlarınız için yanınızdayız.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="group">
              Hizmetlerimizi Keşfedin
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              İletişime Geçin
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
