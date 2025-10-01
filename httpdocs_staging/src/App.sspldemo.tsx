import MarqueeRibbon from "./components/MarqueeRibbon";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import RegistrationSection from "./components/RegistrationSection";
import FooterSection from "./components/FooterSection";

const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <MarqueeRibbon />
      <Header />
      <HeroSection />
      <RegistrationSection />
      <FooterSection />
    </div>
  );
};

export default App;