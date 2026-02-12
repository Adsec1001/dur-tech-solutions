import { FileDown, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Downloads = () => {
  const files = [
    {
      name: "IP & AHD Kamera Sistemi Seçim Rehberi",
      description: "IP ve AHD kamera sistemleri arasındaki farkları sade bir dille anlatan, doğru sistem seçimi için hazırlanmış karşılaştırmalı rehber.",
      path: "/downloads/Dur_Bilisim_Kamera_Rehberi.pdf",
      size: "PDF"
    },
    {
      name: "Güvenlik Kamerası Kataloğu",
      description: "Hikvision, Dahua ve UNV marka güvenlik kameralarının özelliklerini ve müşteri puanlarını içeren ürün kataloğu.",
      path: "/downloads/Dur_Bilisim_Kamera_Katalogu.pdf",
      size: "PDF"
    }
  ];

  return (
    <section id="downloads" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Yardımcı Dokümanlar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Güvenlik sistemleri hakkında faydalı dokümanlarımızı buradan indirebilirsiniz
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {files.map((file, index) => (
            <Card 
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/10 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{file.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{file.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2 hover:border-primary hover:text-primary"
                      asChild
                    >
                      <a href={file.path} download>
                        <FileDown className="h-4 w-4" />
                        İndir
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Downloads;
