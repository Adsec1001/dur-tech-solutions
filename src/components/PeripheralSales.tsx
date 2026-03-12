import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SystemBuilder from "@/components/SystemBuilder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_url: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

const PeripheralSales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setProducts(data as Product[]);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) return null;
  if (products.length === 0) {
    return (
      <section id="peripherals" className="py-20">
        <div className="container">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ürünlerimiz</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Yakında ürünler eklenecektir</p>
          </div>
          <SystemBuilder />
        </div>
      </section>
    );
  }

  return (
    <section id="peripherals" className="py-20">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ürünlerimiz</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">İhtiyacınıza uygun ürünler için bilgi alın</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item, index) => (
            <Card
              key={item.id}
              className="border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 animate-scale-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              {item.image_url ? (
                <div className="h-48 overflow-hidden cursor-pointer" onClick={() => setZoomedImage(item.image_url)}>
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardHeader className="pt-4">
                {item.category && (
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{item.category}</Badge>
                  </div>
                )}
                <CardTitle className="text-xl">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                )}
                {item.features && item.features.length > 0 && (
                  <ul className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                {item.price != null && item.price > 0 && (
                  <p className="text-lg font-bold text-primary mt-3">{item.price.toLocaleString("tr-TR")} ₺</p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full hover:scale-105 transition-transform duration-300"
                  onClick={() => window.open("https://wa.me/905397784000?text=Merhaba%20" + encodeURIComponent(item.name) + "%20hakkında%20bilgi%20almak%20istiyorum.", "_blank")}
                >
                  Bilgi Al
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <SystemBuilder />

        <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-background/95 border-border">
            {zoomedImage && (
              <img src={zoomedImage} alt="Ürün" className="w-full h-full object-contain max-h-[85vh] rounded" />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default PeripheralSales;
