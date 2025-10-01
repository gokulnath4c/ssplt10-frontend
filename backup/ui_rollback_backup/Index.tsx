import MainLayout from "@/components/MainLayout";
import ContentWrapper from "@/components/ContentWrapper";
import HeroSection from "@/components/HeroSection";
import ImageCarouselSection from "@/components/ImageCarouselSection";
import LeagueHighlightsSection from "@/components/LeagueHighlightsSection";
import SSPLAnthemSection from "@/components/SSPLAnthemSection";
import SSPLHighlightsSection from "@/components/SSPLHighlightsSection";
import SSPLGallerySection from "@/components/SSPLGallerySection";
import RegistrationSection from "@/components/RegistrationSection";
import CricketOrganizerDealsSection from "@/components/CricketOrganizerDealsSection";
import PlayerRegistrationStepper from "@/components/PlayerRegistrationStepper";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  console.log('🏠 Index page component rendering...');

  const { user, userRole, loading, roleLoading } = useAuth();
  const [showRegistrationStepper, setShowRegistrationStepper] = useState(false);

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
    <MainLayout>
      {/* Clean User Welcome Banner */}
      {user && !loading && userRole === 'admin' && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-4 shadow-lg relative z-10 mb-8">
          <ContentWrapper maxWidth="full" spacing="none">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Welcome back, Admin</span>
              </div>
              <Link to="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/30 text-xs backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </ContentWrapper>
        </div>
      )}

      {/* Main Content with smooth transitions */}
      <div className="space-y-16">
        <HeroSection />

        {/* Section dividers with subtle gradients */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent-300/20 to-transparent"></div>

        <CricketOrganizerDealsSection />

        <div className="h-px bg-gradient-to-r from-transparent via-primary-600/20 to-transparent"></div>

        <ImageCarouselSection />

        <div className="h-px bg-gradient-to-r from-transparent via-primary-600/20 to-transparent"></div>

        <LeagueHighlightsSection />

        <div className="h-px bg-gradient-to-r from-transparent via-primary-600/20 to-transparent"></div>

        <SSPLAnthemSection />

        <div className="h-px bg-gradient-to-r from-transparent via-primary-600/20 to-transparent"></div>

        <SSPLHighlightsSection />

        <div className="h-px bg-gradient-to-r from-transparent via-primary-600/20 to-transparent"></div>

        <SSPLGallerySection />

        <div className="h-px bg-gradient-to-r from-transparent via-primary-600/20 to-transparent"></div>

        <RegistrationSection />
      </div>

      {/* Player Registration Stepper Modal - Auto-opens on website load */}
      <Dialog open={showRegistrationStepper} onOpenChange={setShowRegistrationStepper}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-center flex-1">
                <img src="/ssplt10-logo.png" alt="SSPL Logo" className="w-12 h-12 mx-auto mb-2" />
                Player Registration
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRegistrationStepper(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                aria-label="Close registration modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <PlayerRegistrationStepper />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Index;