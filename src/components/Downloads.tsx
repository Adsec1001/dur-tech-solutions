import { FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import imgGuide from "@/assets/doc-camera-guide.jpg";
import imgCatalog from "@/assets/doc-camera-catalog.jpg";

const Downloads = () => {
  const files = [
    {
      name: "IP & AHD Kamera Sistemi Seçim Rehberi",
      description: "IP ve AHD kamera sistemleri arasındaki farkları sade bir dille anlatan, doğru sistem seçimi için hazırlanmış karşılaştırmalı rehber.",
      path: "/downloads/Dur_Bilisim_Kamera_Rehberi.pdf",
      size: "PDF",
      image: imgGuide,
    },
    {
      name: "Güvenlik Kamerası Kataloğu",
      description: "Hikvision, Dahua ve UNV marka güvenlik kameralarının özelliklerini ve müşteri puanlarını içeren ürün kataloğu.",
      path: "/downloads/Dur_Bilisim_Kamera_Katalogu.pdf",
      size: "PDF",
      image: imgCatalog,
    }
  ];

  return (
    <section id="downloads" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Yardımcı Dokümanlar</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Güvenlik sistemleri hakkında faydalı dokümanlarımızı buradan indirebilirsiniz</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {files.map((file, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/10 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <div className="h-48 overflow-hidden">
                <img src={file.image} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-1">{file.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{file.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{file.size}</span>
                  <Button size="sm" variant="outline" className="gap-2 hover:border-primary hover:text-primary" asChild>
                    <a href={file.path} download>
                      <FileDown className="h-4 w-4" />
                      İndir
                    </a>
                  </Button>
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
