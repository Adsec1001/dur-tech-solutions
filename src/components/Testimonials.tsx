import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    company: "ABC Teknoloji",
    content: "Dur Bilişim ile çalışmak büyük bir keyif. Teknik destek ekibi her zaman hızlı ve profesyonel çözümler sunuyor.",
    role: "IT Müdürü"
  },
  {
    id: 2,
    name: "Fatma Kaya",
    company: "XYZ Holding",
    content: "Bilgisayar sistemlerimizin kurulumu ve bakımı konusunda mükemmel bir iş çıkardılar. Kesinlikle tavsiye ederim.",
    role: "Genel Müdür"
  },
  {
    id: 3,
    name: "Mehmet Demir",
    company: "Delta Yazılım",
    content: "Yıllardır Dur Bilişim'den hizmet alıyoruz. Güvenilir ve kaliteli çözümleri ile işlerimizi kolaylaştırıyorlar.",
    role: "Yazılım Direktörü"
  },
  {
    id: 4,
    name: "Ayşe Öztürk",
    company: "Mega Market",
    content: "Kasa sistemlerimizin kurulumu ve teknik desteği konusunda çok memnunuz. Profesyonel bir ekip.",
    role: "Operasyon Müdürü"
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section id="testimonials" className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Müşteri <span className="text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]">Yorumları</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Müşterilerimizin bizim hakkımızdaki düşünceleri
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 border-primary/30 hover:border-primary hover:bg-primary/10 hidden md:flex"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 border-primary/30 hover:border-primary hover:bg-primary/10 hidden md:flex"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>

          {/* Testimonial Card */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <Card className="bg-card/50 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
                    <CardContent className="p-8 md:p-12 text-center">
                      <Quote className="h-10 w-10 text-primary mx-auto mb-6 opacity-50" />
                      <p className="text-lg md:text-xl text-foreground/90 mb-8 leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                      <div>
                        <h4 className="text-lg font-semibold text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">
                          {testimonial.name}
                        </h4>
                        <p className="text-muted-foreground">
                          {testimonial.role} - {testimonial.company}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary shadow-neon w-8"
                    : "bg-muted-foreground/30 hover:bg-primary/50"
                }`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-4 mt-6 md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5 text-primary" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
