import logo from "@/assets/durbilisim.png";
import { Facebook, Instagram, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Dur Bilişim Logo" className="h-8 w-auto" />
              <span className="font-bold text-foreground">Dur Bilişim</span>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/profile.php?id=61562039079557#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/durbilisim/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://wa.me/905397784000?text=Merhaba%20teknik%20destek%20almak%20istiyorum" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-5 w-5" />
              </a>
              <a href="tel:+905394425433" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                0539 442 54 33
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Yusuf Kılıç, 217. Cd No:63, 33220 Toroslar/Mersin</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2026 Dur Bilişim. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
