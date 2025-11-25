import logo from "@/assets/durbilisim.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Dur Bilişim Logo" className="h-8 w-auto" />
            <span className="font-bold text-foreground">Dur Bilişim</span>
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
