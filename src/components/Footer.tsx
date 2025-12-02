import logo from "@/assets/durbilisim.png";
import { Facebook, Instagram, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
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
            <a href="https://wa.me/905397784000?text=Merhaba%2C%20teknik%20destek%20talebim%20var%C4%B1%2E" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-5 w-5" />
            </a>
          </div>
          
          <p className="text-sm text-muted-foreground text-center md:text-right">
            © 2025 Dur Bilişim. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
