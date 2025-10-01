import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogIn, LogOut, Shield, ChevronDown, Trophy, Users, Image, Phone, Calendar, MapPin, ExternalLink, Mail } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { googleAnalytics } from "@/utils/googleAnalytics";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const { user, userRole, signOut, loading, roleLoading } = useAuth();

  // Check if we're on the homepage
  const isHomepage = location.pathname === '/';

  // Debug logging for mobile menu (removed for production)

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Function to manually navigate to admin panel
  const goToAdminPanel = () => {
    window.location.href = '/admin';
  };

  return (
    <header
      role="banner"
      className={cn(
        isHomepage ? "sticky top-0 z-40 transition-all duration-300" : "relative z-40",
        isScrolled
          ? "bg-sport-dark shadow-lg border-b border-sport-orange/20"
          : "bg-sport-dark"
      )}
    >

      {/* Screen Reader Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="header-announcements">
        {isMobileMenuOpen ? 'Mobile menu opened' : 'Mobile menu closed'}
      </div>
      <div className="container mx-auto px-2 sm:px-5 lg:px-7 max-w-7xl">
        <div className="flex items-center justify-between h-10 sm:h-12 lg:h-14">
          {/* Logo */}
          <div className="flex items-center px-1">
            <img
              src="/ssplt10-logo.png?v=1.0"
              alt="Southern Street Premier League T10 - Tennis Ball Cricket Tournament Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain"
            />
          </div>

          {/* Mobile Register Button - Only visible on mobile */}
          <div className="md:hidden flex items-center">
            <Link to="/register">
              <Button
                className="bg-gradient-to-r from-sport-orange to-sport-teal text-white font-semibold px-3 py-1.5 sm:px-grid-2 sm:py-grid-1 text-xs sm:text-sm rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-['Poppins'] animate-pulse-glow min-w-[90px] sm:min-w-[100px]"
                onClick={() => googleAnalytics.trackButtonClick('register_now', 'header_mobile')}
              >
                Register now
              </Button>
            </Link>
          </div>

          {/* Desktop Navigation with Mega Menu */}
          <nav className="hidden md:flex items-center space-x-grid-1 lg:space-x-4" ref={megaMenuRef} role="navigation" aria-label="Main navigation">
            <Link
              to="/"
              className="text-white hover:text-sport-orange transition-all duration-300 text-sm font-bold hover:scale-105 relative group px-3 py-grid-1 rounded-lg hover:bg-sport-orange/10 font-['Oswald'] uppercase tracking-wider"
              aria-current={isHomepage ? 'page' : undefined}
            >
              Home
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-sport-orange transition-all duration-300 group-hover:w-3/4"></span>
            </Link>

            {/* About Us Mega Menu */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveMegaMenu('about')}
                onClick={() => {
                  setActiveMegaMenu(activeMegaMenu === 'about' ? null : 'about');
                }}
                className="text-white hover:text-sport-orange transition-all duration-300 text-sm font-bold hover:scale-105 relative group px-3 py-grid-1 rounded-lg hover:bg-sport-orange/10 flex items-center gap-1 font-['Oswald'] uppercase tracking-wider"
                aria-haspopup="true"
                aria-expanded={activeMegaMenu === 'about'}
                aria-label="About Us menu"
              >
                About Us
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 text-sport-orange ${activeMegaMenu === 'about' ? 'rotate-180' : ''}`} aria-hidden="true" />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-sport-teal transition-all duration-300 group-hover:w-3/4"></span>
              </button>

              {/* About Us Mega Menu Dropdown */}
              {activeMegaMenu === 'about' && (
                <div
                  className="absolute top-full left-0 mt-grid-1 w-64 bg-sport-dark/95 backdrop-blur-xl shadow-xl rounded-xl shadow-card border border-sport-orange/30 p-grid-3 z-50 animate-fade-in"
                  onMouseEnter={() => setActiveMegaMenu('about')}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sport-orange flex items-center gap-grid-1 font-['Poppins']">
                      <span className="text-lg">ℹ️</span>
                      About SSPL T10
                    </h4>
                    <Link
                      to="/about-us"
                      onClick={() => setActiveMegaMenu(null)}
                      className="block text-sm text-white hover:text-sport-teal transition-colors py-1 cursor-pointer font-['Poppins']"
                    >
                      About Us
                    </Link>
                    <Link
                      to="/how-it-works"
                      onClick={() => setActiveMegaMenu(null)}
                      className="block text-sm text-white hover:text-sport-teal transition-colors py-1 cursor-pointer font-['Poppins']"
                    >
                      How It Works
                    </Link>
                    <Link
                      to="/enquiry"
                      onClick={() => setActiveMegaMenu(null)}
                      className="block text-sm text-white hover:text-sport-teal transition-colors py-1 cursor-pointer font-['Poppins']"
                    >
                      Enquiry
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Teams Mega Menu */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveMegaMenu('teams')}
                className="text-white hover:text-sport-orange transition-all duration-300 text-sm font-bold hover:scale-105 relative group px-3 py-grid-1 rounded-lg hover:bg-sport-orange/10 flex items-center gap-1 font-['Oswald'] uppercase tracking-wider"
                aria-expanded={activeMegaMenu === 'teams'}
                aria-haspopup="true"
                aria-label="Teams menu"
              >
                Teams
                <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-sport-orange" aria-hidden="true" />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-sport-teal transition-all duration-300 group-hover:w-3/4"></span>
              </button>

              {/* Teams Mega Menu Dropdown */}
              {activeMegaMenu === 'teams' && (
                <div className="absolute top-full left-0 mt-grid-1 w-80 bg-sport-dark/95 backdrop-blur-xl shadow-xl rounded-xl shadow-card border border-sport-orange/30 p-grid-3 z-50 animate-fade-in">
                  <div className="grid grid-cols-2 gap-grid-2">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sport-orange flex items-center gap-grid-1 font-['Poppins']">
                        <Trophy className="w-4 h-4" />
                        Teams
                      </h4>
                      <a href="/#teams" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">All Teams</a>
                      <a href="/#standings" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Standings</a>
                      <a href="/#schedule" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Match Schedule</a>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sport-orange flex items-center gap-grid-1 font-['Poppins']">
                        <Users className="w-4 h-4" />
                        Players
                      </h4>
                      <a href="#players" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Player Profiles</a>
                      <a href="#stats" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Statistics</a>
                      <a href="#records" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Records</a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Mega Menu */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveMegaMenu('gallery')}
                className="text-white hover:text-sport-orange transition-all duration-300 text-sm font-bold hover:scale-105 relative group px-3 py-grid-1 rounded-lg hover:bg-sport-orange/10 flex items-center gap-1 font-['Oswald'] uppercase tracking-wider"
                aria-expanded={activeMegaMenu === 'gallery'}
                aria-haspopup="true"
                aria-label="Gallery menu"
              >
                Gallery
                <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-sport-orange" aria-hidden="true" />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-sport-teal transition-all duration-300 group-hover:w-3/4"></span>
              </button>

              {/* Gallery Mega Menu Dropdown */}
              {activeMegaMenu === 'gallery' && (
                <div className="absolute top-full left-0 mt-grid-1 w-72 bg-sport-dark/95 backdrop-blur-xl shadow-xl rounded-xl shadow-card border border-sport-orange/30 p-grid-3 z-50 animate-fade-in">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sport-orange flex items-center gap-grid-1 font-['Poppins']">
                      <Image className="w-4 h-4" />
                      Gallery
                    </h4>
                    <a href="#photos" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Match Photos</a>
                    <a href="#videos" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Match Highlights</a>
                    <a href="#moments" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Fan Moments</a>
                    <a href="#behind-scenes" className="block text-sm text-white hover:text-sport-teal transition-colors py-1 font-['Poppins']">Behind the Scenes</a>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Mega Menu */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setActiveMegaMenu('contact')}
                className="text-white hover:text-sport-orange transition-all duration-300 text-sm font-bold hover:scale-105 relative group px-3 py-grid-1 rounded-lg hover:bg-sport-orange/10 flex items-center gap-1 font-['Oswald'] uppercase tracking-wider"
                aria-expanded={activeMegaMenu === 'contact'}
                aria-haspopup="true"
                aria-label="Contact menu"
              >
                Contact
                <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180 text-sport-orange" aria-hidden="true" />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-sport-teal transition-all duration-300 group-hover:w-3/4"></span>
              </button>

              {/* Contact Mega Menu Dropdown */}
              {activeMegaMenu === 'contact' && (
                <div className="absolute top-full left-0 mt-grid-1 w-80 bg-sport-dark shadow-xl rounded-xl border border-sport-orange/50 p-grid-3 z-50 animate-fade-in">
                  <div className="grid grid-cols-1 gap-grid-2">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sport-orange flex items-center gap-grid-1 font-['Poppins'] text-white">
                        <Phone className="w-4 h-4" />
                        Get in Touch
                      </h4>
                      <div className="space-y-2 text-sm text-white">
                        <div className="flex items-center gap-grid-1 text-white">
                          <Phone className="w-3 h-3 text-sport-orange" />
                          <span className="text-white font-oswald">+91 88077 75960</span>
                        </div>
                        <div className="flex items-center gap-grid-1 text-white">
                          <Mail className="w-3 h-3 text-sport-orange" />
                          <span className="text-white font-oswald">info@ssplt10.co.in</span>
                        </div>
                        <div className="flex items-center gap-grid-1 text-white">
                          <MapPin className="w-3 h-3 text-sport-orange" />
                          <span className="text-white">Chennai, Tamil Nadu</span>
                        </div>
                      </div>
                      <a href="#contact" className="inline-block bg-gradient-to-r from-sport-orange to-sport-teal text-white px-grid-2 py-grid-1 rounded-lg text-sm font-medium hover:scale-105 transition-transform animate-pulse-glow font-['Poppins']">
                        Contact Us
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Register Now Button - Desktop and Mobile */}
            <div className="flex items-center">
              <Link to="/register">
                <Button
                  className="bg-gradient-to-r from-sport-orange to-sport-teal text-white font-semibold px-3 py-1 sm:px-6 sm:py-grid-1 text-xs sm:text-sm rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-['Poppins'] animate-pulse-glow"
                  onClick={() => googleAnalytics.trackButtonClick('register_now', 'header_desktop')}
                >
                  Register Now
                </Button>
              </Link>
            </div>

            {!loading && user && (
              <div className="flex items-center gap-grid-2">
                <div className="flex items-center gap-grid-1 text-sm lg:text-base text-white">
                  <User className="w-4 h-4 text-sport-orange" />
                  <span className="font-['Poppins']">{user.email}</span>

                  {/* Admin Panel Button - Only show if userRole is admin */}
                  {userRole === 'admin' && (
                    <Link to="/admin" className="ml-2">
                      <Button variant="outline" size="sm" className="bg-sport-orange text-sport-dark hover:scale-105 border-sport-orange/20 shadow-lg hover:bg-sport-orange/90 font-['Poppins']">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>


                <Button
                  variant="header"
                  onClick={() => {
                    googleAnalytics.trackButtonClick('sign_out', 'header');
                    signOut();
                  }}
                  className="text-xs sm:text-sm text-white hover:text-sport-orange font-['Poppins']"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Overlay - Enhanced with new utilities */}
          {isMobileMenuOpen && (
            <div
              className="mobile-menu-overlay md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              {/* Backdrop - Touch-friendly */}
              <div
                className="absolute inset-0"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                aria-label="Close mobile menu"
              />

              {/* Mobile Menu Panel - Enhanced with responsive utilities */}
              <div
                className={`mobile-menu-panel ${isMobileMenuOpen ? 'open' : ''}`}
                id="mobile-navigation"
                role="navigation"
                aria-label="Mobile navigation"
                style={{ backgroundColor: '#1A1F2B' }}
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header - Enhanced Touch Targets */}
                  <div className="flex items-center justify-between p-grid-2 border-b border-sport-orange/30 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <img
                        src="/ssplt10-logo.png?v=1.0"
                        alt="Southern Street Premier League T10 - Tennis Ball Cricket Tournament Logo"
                        className="w-8 h-8 object-contain"
                      />
                      <span className="font-semibold text-sport-orange font-['Poppins']">SSPL T10</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        googleAnalytics.trackButtonClick('close_mobile_menu', 'mobile_menu_header');
                      }}
                      className="touch-target p-grid-1 rounded-lg hover:bg-sport-orange/30 transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5 text-sport-orange" />
                    </button>
                  </div>

                  {/* Mobile Menu Content - Enhanced Touch Targets */}
                  <div className="flex-1 overflow-y-auto py-4" style={{ minHeight: 0, userSelect: 'text', WebkitUserSelect: 'text', pointerEvents: 'auto' }}>
                    <nav className="px-grid-2 space-y-1" style={{ userSelect: 'text', WebkitUserSelect: 'text', pointerEvents: 'auto' }}>

                      {/* Main Navigation - Touch-friendly */}
                      <Link
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="touch-target flex items-center gap-3 px-grid-2 py-3 text-white hover:text-sport-orange hover:bg-sport-orange/30 rounded-lg transition-all duration-200 font-medium font-['Poppins']"
                      >
                        <span className="text-lg">🏠</span>
                        Home
                      </Link>

                      {/* About Us with submenu */}
                      <div className="space-y-1">
                        <div className="px-grid-2 py-grid-1 text-sport-orange font-semibold text-sm uppercase tracking-wide font-['Poppins']">
                          ℹ️ About SSPL T10
                        </div>

                        <Link
                          to="/about-us"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-grid-2 py-3 text-white hover:text-sport-orange hover:bg-sport-orange/30 rounded-lg transition-all duration-200 font-medium ml-grid-2 font-['Poppins']"
                        >
                          <span className="text-sm">📄</span>
                          About Us
                        </Link>

                        <Link
                          to="/how-it-works"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-grid-2 py-3 text-white hover:text-sport-orange hover:bg-sport-orange/30 rounded-lg transition-all duration-200 font-medium ml-grid-2 font-['Poppins']"
                        >
                          <span className="text-sm">⚙️</span>
                          How It Works
                        </Link>

                        <Link
                          to="/enquiry"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-grid-2 py-3 text-white hover:text-sport-orange hover:bg-sport-orange/30 rounded-lg transition-all duration-200 font-medium ml-grid-2 font-['Poppins']"
                        >
                          <span className="text-sm">📝</span>
                          Enquiry
                        </Link>
                      </div>

                      <Link
                        to="/register"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          googleAnalytics.trackButtonClick('register_now', 'mobile_menu');
                        }}
                        className="touch-target flex items-center justify-center gap-grid-1 mx-4 mt-grid-1 bg-gradient-to-r from-sport-orange to-sport-teal text-white px-grid-2 py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg animate-pulse-glow font-['Poppins']"
                      >
                        <span className="text-lg">📝</span>
                        Register Now
                      </Link>

                      {/* Teams & Players Section */}
                      <div className="border-t border-sport-orange/30 my-3 pt-3">
                        <div className="px-grid-2 py-grid-1 text-sport-orange font-semibold text-sm uppercase tracking-wide font-['Poppins']">
                          🏏 Cricket Sections
                        </div>

                        <Link
                          to="/teams"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-grid-2 py-3 text-white hover:text-sport-orange hover:bg-sport-orange/30 rounded-lg transition-all duration-200 font-medium ml-grid-2 font-['Poppins']"
                        >
                          <Trophy className="w-4 h-4 text-sport-orange" />
                          Teams & Standings
                        </Link>

                        <Link
                          to="/players"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-grid-2 py-3 text-white hover:text-sport-orange hover:bg-sport-orange/30 rounded-lg transition-all duration-200 font-medium ml-grid-2 font-['Poppins']"
                        >
                          <Users className="w-4 h-4 text-sport-orange" />
                          Players & Stats
                        </Link>

                        <Link
                          to="/gallery"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-grid-2 py-3 text-white hover:text-sport-orange hover:bg-sport-orange/30 rounded-lg transition-all duration-200 font-medium ml-grid-2 font-['Poppins']"
                        >
                          <Image className="w-4 h-4 text-sport-orange" />
                          Gallery
                        </Link>
                      </div>

                      {/* Contact Information */}
                      <div className="border-t border-sport-orange/30 my-3 pt-3">
                        <div className="px-grid-2 py-grid-1 text-sport-orange font-semibold text-sm uppercase tracking-wide font-['Poppins']">
                          📞 Get In Touch
                        </div>

                        <div className="px-grid-2 py-3 space-y-2 text-sm text-white">
                          <div className="flex items-center gap-grid-1">
                            <Phone className="w-4 h-4 text-sport-orange" />
                            <span>+91 88077 75960</span>
                          </div>
                          <div className="flex items-center gap-grid-1">
                            <Mail className="w-4 h-4 text-sport-orange" />
                            <span>info@ssplt10.co.in</span>
                          </div>
                          <div className="flex items-center gap-grid-1">
                            <MapPin className="w-4 h-4 text-sport-orange" />
                            <span>Chennai, Tamil Nadu</span>
                          </div>
                        </div>

                        <a
                          href="#contact"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-grid-1 w-full mx-4 mt-3 bg-gradient-to-r from-sport-orange to-sport-teal text-white px-grid-2 py-3 rounded-lg font-medium hover:scale-105 transition-transform animate-pulse-glow font-['Poppins']"
                        >
                          <Phone className="w-4 h-4" />
                          Contact Us
                        </a>
                      </div>
                    </nav>
                  </div>

                  {/* Mobile Menu Footer - User Authentication */}
                  <div className="border-t border-sport-orange/30 p-grid-2 flex-shrink-0">
                    {!loading && user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 px-3 py-grid-1 bg-sport-orange/20 rounded-lg">
                          <User className="w-4 h-4 text-sport-orange" />
                          <span className="text-sm text-white truncate font-['Poppins']">{user.email}</span>
                        </div>

                        {/* Admin Panel Button */}
                        {userRole === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-grid-1 w-full bg-sport-orange text-sport-dark px-grid-2 py-grid-1 rounded-lg font-medium hover:scale-105 transition-transform font-['Poppins']"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => {
                            googleAnalytics.trackButtonClick('sign_out', 'mobile_menu');
                            signOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-['Poppins']"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Button - Enhanced Touch Target */}
          <button
            type="button"
            onClick={() => {
              const newState = !isMobileMenuOpen;
              setIsMobileMenuOpen(newState);
              googleAnalytics.trackButtonClick(
                newState ? 'open_mobile_menu' : 'close_mobile_menu',
                'header'
              );
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const newState = !isMobileMenuOpen;
                setIsMobileMenuOpen(newState);
                googleAnalytics.trackButtonClick(
                  newState ? 'open_mobile_menu' : 'close_mobile_menu',
                  'header'
                );
              }
            }}
            className="touch-target md:hidden p-grid-1 rounded-lg hover:bg-sport-orange/30 focus:outline-none focus:ring-2 focus:ring-sport-orange focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X size={24} className="text-sport-orange" aria-hidden="true" /> : <Menu size={24} className="text-sport-orange" aria-hidden="true" />}
          </button>

        </div>

      </div>
    </header>
  );
};

export default Header;