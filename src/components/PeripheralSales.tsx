import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import SystemBuilder from "@/components/SystemBuilder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_urls: string[];
  features: string[];
  is_active: boolean;
  sort_order: number;
  stock: number;
}

const PeripheralSales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedImages, setZoomedImages] = useState<string[]>([]);
  const [zoomedIndex, setZoomedIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  const openProduct = useCallback((product: Product, imageIndex = 0) => {
    setSelectedProduct(product);
    setDetailImageIndex(imageIndex);
  }, []);

  const closeProduct = useCallback(() => {
    setSelectedProduct(null);
    setDetailImageIndex(0);
  }, []);

  const openWhatsApp = useCallback((productName: string) => {
    window.open(
      "https://wa.me/905397784000?text=Merhaba%20" + encodeURIComponent(productName) + "%20hakkında%20bilgi%20almak%20istiyorum.",
      "_blank"
    );
  }, []);

  const openZoom = useCallback((images: string[], startIndex: number) => {
    setZoomedImages(images);
    setZoomedIndex(startIndex);
  }, []);

  const closeZoom = useCallback(() => {
    setZoomedImages([]);
    setZoomedIndex(0);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setProducts(data as unknown as Product[]);
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
            <ShoppingBag className="h-10 w-10 text-primary mx-auto mb-4" />
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
          <ShoppingBag className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ürünlerimiz</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Kaliteli ve uygun fiyatlı teknoloji ürünleriyle ihtiyacınıza en uygun çözümü sunuyoruz. Detaylı bilgi almak için hemen bize ulaşın.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {products.map((item, index) => (
            <Card
              key={item.id}
              className="border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 animate-scale-in overflow-hidden flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
              role="button"
              tabIndex={0}
              aria-label={`${item.name} ürününü incele`}
              onClick={() => openProduct(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openProduct(item);
                }
              }}
            >
              {item.image_urls && item.image_urls.length > 0 ? (
                item.image_urls.length === 1 ? (
                  <div className="h-44 overflow-hidden">
                    <img src={item.image_urls[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  </div>
                ) : (
                  <Carousel className="w-full" onClick={(event) => event.stopPropagation()}>
                    <CarouselContent>
                      {item.image_urls.map((url, idx) => (
                        <CarouselItem key={idx}>
                          <div className="h-44 overflow-hidden cursor-pointer" onClick={() => openProduct(item, idx)}>
                            <img src={url} alt={`${item.name} ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 h-7 w-7" />
                    <CarouselNext className="right-2 h-7 w-7" />
                  </Carousel>
                )
              ) : (
                <div className="h-44 bg-muted flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardHeader className="pt-4 pb-2">
                <div className="flex items-start justify-between mb-1">
                  {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                  <Badge 
                    variant={item.stock > 0 ? "default" : "destructive"} 
                    className={`text-xs font-bold animate-pulse ${
                      item.stock === 0 
                        ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                        : item.stock <= 3 
                          ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                          : item.stock <= 5 
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.4)]" 
                            : "bg-primary/20 text-primary border-primary/50 shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                    }`}
                  >
                    {item.stock > 0 ? `${item.stock} adet` : "Tükendi"}
                  </Badge>
                </div>
                <CardTitle className="text-base leading-tight">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                {item.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                )}
                {item.features && item.features.length > 0 && (
                  <ul className="space-y-1">
                    {item.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary mr-1.5 shrink-0" />
                        <span className="truncate">{feature}</span>
                      </li>
                    ))}
                    {item.features.length > 3 && (
                      <li className="text-xs text-primary">+{item.features.length - 3} daha</li>
                    )}
                  </ul>
                )}
                {item.price != null && item.price > 0 && (
                  <p className="text-base font-bold text-primary mt-2">{item.price.toLocaleString("tr-TR")} ₺</p>
                )}
              </CardContent>
              <CardFooter className="pt-0 mt-auto">
                <Button
                  className="w-full hover:scale-105 transition-transform duration-300"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    openWhatsApp(item.name);
                  }}
                >
                  Bilgi Al
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <SystemBuilder />

        <Dialog open={selectedProduct !== null} onOpenChange={(open) => !open && closeProduct()}>
          <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 bg-background border-border">
            {selectedProduct && (
              <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="min-w-0 bg-muted/40 p-4 sm:p-6">
                  {selectedProduct.image_urls.length > 0 ? (
                    <>
                      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-border bg-background">
                        <img
                          src={selectedProduct.image_urls[detailImageIndex]}
                          alt={`${selectedProduct.name} ürün görseli`}
                          className="h-full w-full object-contain p-3"
                        />
                      </div>
                      {selectedProduct.image_urls.length > 1 && (
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {selectedProduct.image_urls.map((url, index) => (
                            <Button
                              key={url}
                              type="button"
                              variant="ghost"
                              className={`aspect-square overflow-hidden rounded-md border bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                detailImageIndex === index ? "border-primary" : "border-border hover:border-primary/60"
                              }`}
                              onClick={() => setDetailImageIndex(index)}
                              aria-label={`${index + 1}. görseli göster`}
                            >
                              <img src={url} alt="" className="h-full w-full object-cover" />
                            </Button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-md border border-border bg-muted">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-col p-5 sm:p-8">
                  <DialogHeader className="pr-6 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedProduct.category && <Badge variant="secondary">{selectedProduct.category}</Badge>}
                      <Badge variant={selectedProduct.stock > 0 ? "default" : "destructive"}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} adet stokta` : "Tükendi"}
                      </Badge>
                    </div>
                    <DialogTitle className="pt-3 text-2xl leading-tight sm:text-3xl">{selectedProduct.name}</DialogTitle>
                    {selectedProduct.description && (
                      <DialogDescription className="pt-2 text-sm leading-7 text-muted-foreground sm:text-base">
                        {selectedProduct.description}
                      </DialogDescription>
                    )}
                  </DialogHeader>

                  {selectedProduct.features.length > 0 && (
                    <div className="mt-6 border-t border-border pt-5">
                      <h3 className="mb-3 text-base font-semibold text-foreground">Ürün özellikleri</h3>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {selectedProduct.features.map((feature, index) => (
                          <li key={`${feature}-${index}`} className="flex items-start gap-2.5 text-sm leading-6 text-foreground">
                            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="break-words">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto border-t border-border pt-6">
                    {selectedProduct.price != null && selectedProduct.price > 0 && (
                      <p className="mb-4 text-2xl font-bold text-primary">{selectedProduct.price.toLocaleString("tr-TR")} ₺</p>
                    )}
                    <Button className="w-full" size="lg" onClick={() => openWhatsApp(selectedProduct.name)}>
                      WhatsApp'tan Bilgi Al
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={zoomedImages.length > 0} onOpenChange={closeZoom}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-background/95 border-border">
            {zoomedImages.length > 0 && (
              <div className="relative flex items-center justify-center">
                {zoomedImages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
                    onClick={() => setZoomedIndex((zoomedIndex - 1 + zoomedImages.length) % zoomedImages.length)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                <img src={zoomedImages[zoomedIndex]} alt="Ürün" className="w-full h-full object-contain max-h-[85vh] rounded" />
                {zoomedImages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
                    onClick={() => setZoomedIndex((zoomedIndex + 1) % zoomedImages.length)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
                {zoomedImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                    {zoomedIndex + 1} / {zoomedImages.length}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default PeripheralSales;
