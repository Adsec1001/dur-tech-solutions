import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PeripheralSales from "@/components/PeripheralSales";
import Downloads from "@/components/Downloads";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <PeripheralSales />
      <Downloads />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
