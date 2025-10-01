import MarqueeRibbon from "@/components/MarqueeRibbon";
import Header from "@/components/Header";
import CricketTrialsBanner from "@/components/CricketTrialsBanner";
import HeroSection from "@/components/HeroSection";
import ImageCarouselSection from "@/components/ImageCarouselSection";
import SSPLAnthemSection from "@/components/SSPLAnthemSection";
import SSPLHighlightsSection from "@/components/SSPLHighlightsSection";
import SSPLGallerySection from "@/components/SSPLGallerySection";
import RegistrationSection from "@/components/RegistrationSection";
import CricketOrganizerDealsSection from "@/components/CricketOrganizerDealsSection";
import OurPartnersSection from "@/components/OurPartnersSection";
import FooterSection from "@/components/FooterSection";
import SocialMediaButtons from "@/components/SocialMediaButtons";
import PlayerRegistrationStepper from "@/components/PlayerRegistrationStepper";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Index = () => {
  console.log('🏠 Index page component rendering...');

  const { user, userRole, loading, roleLoading } = useAuth();
  const [showRegistrationStepper, setShowRegistrationStepper] = useState(false);
  const [showCricketBanner, setShowCricketBanner] = useState(true);

  console.log('👤 Auth state:', { user: !!user, userRole, loading, roleLoading });

  // Auto-open PlayerRegistrationStepper when website loads
  useEffect(() => {
    if (!loading) {
      // Delay modal to let the page load first
      const timer = setTimeout(() => {
        setShowRegistrationStepper(true);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer);
    }
  }, [loading]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-x-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-cricket-blue/5 via-transparent to-cricket-purple/5"></div>
      </div>

      <MarqueeRibbon />
      <Header />

      {/* Cricket Trials Banner - Prominently displayed on homepage */}
      {showCricketBanner && (
        <CricketTrialsBanner
          announcement={{
            title: "Upcoming Chennai Trials!",
            venue: "Throttle Sports Academy, Manapakkam",
            date: "Sunday, 28 September 2025",
            body: "Calling all aspiring players waiting for their next big chance!",
            callout: "Players waiting — this one's for you",
            ctaText: "Register Now"
          }}
          onRegister={() => {
            // Navigate to registration page
            window.location.href = '/register';
          }}
          onClose={() => {
            setShowCricketBanner(false);
          }}
          isVisible={showCricketBanner}
          showCloseButton={true}
          className="mb-0"
        />
      )}

      {/* Clean User Welcome Banner */}
      {user && !loading && userRole === 'admin' && (
        <div className="bg-gradient-to-r from-cricket-blue to-cricket-dark-blue text-white py-3 shadow-lg relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Welcome back, Admin</span>
              </div>
              <Link to="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/30 text-xs backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with smooth transitions */}
      <main className="relative z-10">
        <HeroSection />

        {/* Section dividers with subtle gradients */}
        <div className="h-px bg-gradient-to-r from-transparent via-orange-300/20 to-transparent my-8"></div>

        <CricketOrganizerDealsSection />

        <div className="h-px bg-gradient-to-r from-transparent via-cricket-blue/20 to-transparent my-8"></div>

        <ImageCarouselSection />

        <div className="h-px bg-gradient-to-r from-transparent via-cricket-blue/20 to-transparent my-8"></div>


        <SSPLAnthemSection />

        <div className="h-px bg-gradient-to-r from-transparent via-cricket-blue/20 to-transparent my-8"></div>

        <SSPLHighlightsSection />

        <div className="h-px bg-gradient-to-r from-transparent via-cricket-blue/20 to-transparent my-8"></div>

        <SSPLGallerySection />

        <div className="h-px bg-gradient-to-r from-transparent via-cricket-blue/20 to-transparent my-8"></div>

        <RegistrationSection />

        <div className="h-px bg-gradient-to-r from-transparent via-cricket-blue/20 to-transparent my-8"></div>
      </main>

      <OurPartnersSection />

      <FooterSection />

      {/* Social Media Floating Buttons */}
      <SocialMediaButtons />

      {/* Player Registration Stepper Modal - Auto-opens on website load */}
      <Dialog open={showRegistrationStepper} onOpenChange={setShowRegistrationStepper}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <img src="/ssplt10-logo.png" alt="SSPL Logo" className="w-12 h-12 mx-auto mb-2" />
              Player Registration
            </DialogTitle>
            <DialogDescription className="text-center">
              Complete your registration for the SSPL T10 cricket tournament. Follow the steps below to register as a player.
            </DialogDescription>
          </DialogHeader>
          <PlayerRegistrationStepper />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Index;