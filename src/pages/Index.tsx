import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ComputerSystems from "@/components/ComputerSystems";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <ComputerSystems />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
