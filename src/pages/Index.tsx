import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Promotions from "@/components/Promotions";
import ComputerSystems from "@/components/ComputerSystems";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Promotions />
      <ComputerSystems />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
