import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogIn, LogOut, Shield, ChevronDown, Trophy, Users, Image, Phone, Calendar, MapPin, ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const { user, userRole, signOut, loading, roleLoading } = useAuth();

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

  // Debug function to check admin status
  const checkAdminStatus = () => {
    // Debug logging removed for production
  };

  // Function to manually navigate to admin panel
  const goToAdminPanel = () => {
    window.location.href = '/admin';
  };

  return (
    <header
      className="bg-primary-50/95 backdrop-blur-xl shadow-premium sticky top-0 z-50 border-b border-border-light"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 lg:h-24">
          {/* Logo */}
          <div className="flex items-center px-1">
            <img
              src="/ssplt10-logo.png?v=1.0"
              alt="SSPL T10 Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain"
            />
          </div>


          {/* Desktop Navigation with Mega Menu */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4" ref={megaMenuRef}>
            <a href="#home" className="text-foreground hover:text-cricket-blue transition-all duration-300 text-sm font-medium hover:scale-105 relative group px-3 py-2 rounded-lg hover:bg-white/10">
              Home
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-accent transition-all duration-300 group-hover:w-3/4"></span>
            </a>

            <Link to="/about" className="text-foreground hover:text-cricket-blue transition-all duration-300 text-sm font-medium hover:scale-105 relative group px-3 py-2 rounded-lg hover:bg-white/10">
              About Us
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-accent transition-all duration-300 group-hover:w-3/4"></span>
            </Link>

            {/* Teams Mega Menu */}
            <div className="relative">
              <button
                onMouseEnter={() => setActiveMegaMenu('teams')}
                onMouseLeave={() => setActiveMegaMenu(null)}
                className="text-foreground hover:text-cricket-blue transition-all duration-300 text-sm font-medium hover:scale-105 relative group px-2 py-1 rounded-lg hover:bg-white/10 flex items-center gap-1"
              >
                Teams
                <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-accent transition-all duration-300 group-hover:w-3/4"></span>
              </button>

              {/* Teams Mega Menu Dropdown */}
              {activeMegaMenu === 'teams' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-card border border-white/20 p-6 z-50 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-cricket-blue flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Teams
                      </h4>
                      <a href="#teams" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">All Teams</a>
                      <a href="#standings" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Standings</a>
                      <a href="#schedule" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Match Schedule</a>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-cricket-blue flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Players
                      </h4>
                      <a href="#players" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Player Profiles</a>
                      <a href="#stats" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Statistics</a>
                      <a href="#records" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Records</a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Mega Menu */}
            <div className="relative">
              <button
                onMouseEnter={() => setActiveMegaMenu('gallery')}
                onMouseLeave={() => setActiveMegaMenu(null)}
                className="text-foreground hover:text-cricket-blue transition-all duration-300 text-sm font-medium hover:scale-105 relative group px-2 py-1 rounded-lg hover:bg-white/10 flex items-center gap-1"
              >
                Gallery
                <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-accent transition-all duration-300 group-hover:w-3/4"></span>
              </button>

              {/* Gallery Mega Menu Dropdown */}
              {activeMegaMenu === 'gallery' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-xl shadow-card border border-white/20 p-6 z-50 animate-fade-in">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-cricket-blue flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Gallery
                    </h4>
                    <a href="#photos" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Match Photos</a>
                    <a href="#videos" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Match Highlights</a>
                    <a href="#moments" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Fan Moments</a>
                    <a href="#behind-scenes" className="block text-sm text-gray-600 hover:text-cricket-blue transition-colors py-1">Behind the Scenes</a>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Mega Menu */}
            <div className="relative">
              <button
                onMouseEnter={() => setActiveMegaMenu('contact')}
                onMouseLeave={() => setActiveMegaMenu(null)}
                className="text-foreground hover:text-cricket-blue transition-all duration-300 text-sm font-medium hover:scale-105 relative group px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-1"
              >
                Contact
                <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-accent transition-all duration-300 group-hover:w-3/4"></span>
              </button>

              {/* Contact Mega Menu Dropdown */}
              {activeMegaMenu === 'contact' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-card border border-white/20 p-6 z-50 animate-fade-in">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-cricket-blue flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Get in Touch
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>+91 88077 75960</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>info@ssplt10.co.in</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>Chennai, Tamil Nadu</span>
                        </div>
                      </div>
                      <a href="#contact" className="inline-block bg-gradient-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform">
                        Contact Us
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!loading && user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm lg:text-base text-foreground">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>

                  {/* Admin Panel Button - Only show if userRole is admin */}
                  {userRole === 'admin' && (
                    <Link to="/admin" className="ml-2">
                      <Button variant="outline" size="sm" className="bg-[#C1E303] text-black hover:scale-105 border-black/20 shadow-lg hover:bg-[#C1E303]/90">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Debug button for admin users */}
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={checkAdminStatus}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    title="Debug admin status"
                  >
                    🔍
                  </Button>
                )}

                <Button variant="header" onClick={signOut} className="text-xs sm:text-sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-foreground hover:text-primary-600 p-2 rounded-lg hover:bg-primary-100 transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen ? "true" : "false"}
          >
            <div className="relative w-6 h-6">
              <Menu className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-75'}`} />
            </div>
          </button>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <>
            {/* Mobile Menu Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div
              id="mobile-navigation"
              className="md:hidden fixed top-0 right-0 h-full w-80 max-w-[90vw] sm:max-w-[320px] bg-primary-50/95 backdrop-blur-xl shadow-premium border-l border-border-light z-50 transform transition-transform duration-300 ease-out"
              role="navigation"
              aria-label="Mobile navigation menu"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <div className="flex items-center gap-3">
                  <img
                    src="/ssplt10-logo.png?v=1.0"
                    alt="SSPL T10 Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <span className="font-bold text-primary-700 text-lg">SSPL T10</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Main Navigation */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider">Navigation</h3>
                  <nav className="space-y-2" role="navigation" aria-label="Main navigation">
                    <a
                      href="#home"
                      className="flex items-center gap-3 px-4 py-3 sm:py-4 text-secondary-700 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-200 font-medium min-h-[48px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      Home
                    </a>
                    <Link
                      to="/about"
                      className="flex items-center gap-3 px-4 py-3 sm:py-4 text-secondary-700 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-200 font-medium min-h-[48px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users className="w-4 h-4 text-primary-600" />
                      About Us
                    </Link>
                    <a
                      href="#teams"
                      className="flex items-center gap-3 px-4 py-3 sm:py-4 text-secondary-700 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-200 font-medium min-h-[48px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Trophy className="w-4 h-4 text-primary-600" />
                      Teams
                    </a>
                    <a
                      href="#gallery"
                      className="flex items-center gap-3 px-4 py-3 sm:py-4 text-secondary-700 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-200 font-medium min-h-[48px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Image className="w-4 h-4 text-primary-600" />
                      Gallery
                    </a>
                    <a
                      href="#contact"
                      className="flex items-center gap-3 px-4 py-3 sm:py-4 text-secondary-700 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all duration-200 font-medium min-h-[48px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Phone className="w-4 h-4 text-primary-600" />
                      Contact
                    </a>
                  </nav>
                </div>

                {/* User Section */}
                {!loading && user && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider">Account</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-secondary-50 rounded-lg">
                        <User className="w-5 h-5 text-secondary-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">{user.email}</p>
                          <p className="text-xs text-secondary-500">Signed in</p>
                        </div>
                      </div>

                      {/* Admin Panel Button */}
                      {userRole === 'admin' && (
                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full bg-[#C1E303] text-black hover:bg-[#C1E303]/90 border border-black/20">
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-border-light">
                  <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider">Contact Info</h3>
                  <div className="space-y-2 text-sm text-secondary-600">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-primary-600" />
                      <span>+91 88077 75960</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-primary-600" />
                      <span className="break-all">info@ssplt10.co.in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;