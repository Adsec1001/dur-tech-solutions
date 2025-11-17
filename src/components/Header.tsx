import { Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Dur Bilişim</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Button size="sm" className="ml-4">
            Teklif Al
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
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <Button className="mt-4">Teklif Al</Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
