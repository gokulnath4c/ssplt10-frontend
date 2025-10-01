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
import { Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SSPLOnboarding } from "@/components/ui/enhanced-onboarding";

const ClonedIndex = () => {
  const { user, userRole, loading, roleLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    <div className="min-h-screen bg-background">
      <MarqueeRibbon />
      <Header />


      {/* Clean User Welcome Banner */}
      {user && !loading && userRole === 'admin' && (
        <div className="bg-gradient-to-r from-cricket-blue to-cricket-dark-blue text-white py-2">
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
                  className="bg-white/10 text-white hover:bg-white/20 border-white/30 text-xs"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <HeroSection />

      <ImageCarouselSection />

      <LeagueHighlightsSection />

      <SSPLAnthemSection />

      <SSPLHighlightsSection />

      <SSPLGallerySection />

      <RegistrationSection />
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

export default ClonedIndex;