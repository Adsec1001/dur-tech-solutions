import { Menu, Facebook, Instagram, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/db-logo.png";

const Header = () => {
  const menuItems = [
    { label: "Ana Sayfa", href: "#home" },
    { label: "Hizmetler", href: "#services" },
    { label: "Bilgisayar Sistemleri", href: "#systems" },
    { label: "İletişim", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Dur Bilişim Logo" className="h-14 w-auto" />
          <span className="text-xl font-bold text-foreground">Dur Bilişim</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="flex items-center gap-3 ml-4">
            <a href="https://www.facebook.com/profile.php?id=61562039079557#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/durbilisim/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://wa.me/905397784000?text=Merhaba%20teknik%20destek%20almak%20istiyorum" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-5 w-5" />
            </a>
          </div>
          <Button size="sm" className="shadow-neon-sm hover:shadow-neon" asChild>
            <a href="https://bionluk.com/adsec" target="_blank" rel="noopener noreferrer">Dijital Mağaza</a>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <a href="https://www.facebook.com/profile.php?id=61562039079557#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="https://www.instagram.com/durbilisim/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="https://wa.me/905397784000?text=Merhaba%20teknik%20destek%20almak%20istiyorum" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-6 w-6" />
                </a>
              </div>
              <Button className="mt-4 shadow-neon-sm" asChild>
                <a href="https://bionluk.com/adsec" target="_blank" rel="noopener noreferrer">Dijital Mağaza</a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
