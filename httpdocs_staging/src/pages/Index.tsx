import MarqueeRibbon from "@/components/MarqueeRibbon";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ImageCarouselSection from "@/components/ImageCarouselSection";
import LeagueHighlightsSection from "@/components/LeagueHighlightsSection";
import SSPLAnthemSection from "@/components/SSPLAnthemSection";
import SSPLHighlightsSection from "@/components/SSPLHighlightsSection";
import SSPLGallerySection from "@/components/SSPLGallerySection";
import RegistrationSection from "@/components/RegistrationSection";
import FooterSection from "@/components/FooterSection";
import SocialMediaButtons from "@/components/SocialMediaButtons";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SSPLOnboarding } from "@/components/ui/enhanced-onboarding";

const Index = () => {
  console.log('🏠 Index page component rendering...');

  const { user, userRole, loading, roleLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  console.log('👤 Auth state:', { user: !!user, userRole, loading, roleLoading });

  // Show onboarding for new visitors (first-time users)
  useEffect(() => {
    const hasSeenOnboarding = sessionStorage.getItem('sspl-onboarding-seen');
    const isFirstVisit = !hasSeenOnboarding;

    if (isFirstVisit && !loading) {
      // Delay onboarding to let the page load first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('sspl-onboarding-seen', 'true');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('sspl-onboarding-seen', 'true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-x-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-cricket-blue/5 via-transparent to-cricket-purple/5"></div>
      </div>

      <MarqueeRibbon />
      <Header />

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
        <div className="h-px bg-gradient-to-r from-transparent via-cricket-blue/20 to-transparent my-8"></div>

        <ImageCarouselSection />

        <div className="h-px bg-gradient-to-r from-transparent via-cricket-blue/20 to-transparent my-8"></div>

        <LeagueHighlightsSection />

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

      <FooterSection />

      {/* Social Media Floating Buttons */}
      <SocialMediaButtons />

      {/* Onboarding for New Visitors */}
      {showOnboarding && (
        <SSPLOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

    </div>
  );
};

export default Index;