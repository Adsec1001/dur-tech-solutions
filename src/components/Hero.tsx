import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import heroImage from "@/assets/hero-tech.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[700px] flex items-center overflow-hidden">
      {/* Animated background with gradient overlay */}
      <div 
        className="absolute inset-0 z-0 animate-fade-in"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.97) 40%, hsl(var(--background) / 0.85) 70%, hsl(var(--background) / 0.6) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Animated glow effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-glow-pulse" />
      
      <div className="container relative z-10 py-24">
        <div className="max-w-2xl animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-scale-in">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Profesyonel Bilişim Çözümleri</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Teknolojik Çözümleriniz için
            <span className="text-primary block mt-2 drop-shadow-[0_0_10px_hsl(var(--primary))]">
              Güvenilir Ortak
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Güvenlik sistemlerinden Windows lisanslarına, tamir ve bakımdan eğitime kadar 
            tüm bilişim ihtiyaçlarınız için yanınızdayız.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="group bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105"
              onClick={() => scrollToSection('services')}
            >
              Hizmetlerimizi Keşfedin
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 hover:border-primary hover:text-primary hover:scale-105 transition-all duration-300"
              onClick={() => scrollToSection('contact')}
            >
              İletişime Geçin
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-border/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">10+</div>
              <div className="text-sm text-muted-foreground">Yıllık Deneyim</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Mutlu Müşteri</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">7/24</div>
              <div className="text-sm text-muted-foreground">Destek</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
