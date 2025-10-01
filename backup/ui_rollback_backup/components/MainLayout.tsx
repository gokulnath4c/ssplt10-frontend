import { ReactNode } from "react";
import Header from "./Header";
import FooterSection from "./FooterSection";
import MarqueeRibbon from "./MarqueeRibbon";
import SocialMediaButtons from "./SocialMediaButtons";

interface MainLayoutProps {
  children: ReactNode;
  showMarquee?: boolean;
  showSocialButtons?: boolean;
  className?: string;
}

const MainLayout = ({
  children,
  showMarquee = true,
  showSocialButtons = true,
  className = ""
}: MainLayoutProps) => {
  return (
    <div className={`min-h-screen bg-background text-foreground antialiased ${className}`}>
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-3 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:min-h-[44px] focus:min-w-[44px] focus:flex focus:items-center focus:justify-center"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Background pattern overlay - optimized for mobile */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/50" />
      </div>

      {/* Marquee ribbon at the top */}
      {showMarquee && <MarqueeRibbon />}

      {/* Main header */}
      <Header />

      {/* Main content area - enhanced responsive container */}
      <main
        id="main-content"
        className="relative z-10 flex-1"
        role="main"
        aria-label="Main content"
      >
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="w-full max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterSection />

      {/* Social media floating buttons - mobile optimized */}
      {showSocialButtons && <SocialMediaButtons />}
    </div>
  );
};

export default MainLayout;