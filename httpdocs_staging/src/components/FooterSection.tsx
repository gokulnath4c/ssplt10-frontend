import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink
} from "lucide-react";
import TermsAndConditions from "./TermsAndConditions";
import PrivacyPolicy from "./PrivacyPolicy";

const FooterSection = () => {
  return (
    <footer id="contact" className="bg-gradient-primary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cricket-electric-blue rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-cricket-purple rounded-full blur-3xl"></div>
      </div>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* About Section */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-1 mb-2 sm:mb-3">
              <img
                src="/ssplt10-logo.png?v=1.0"
                alt="SSPL T10 Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">SSPL T10</h3>
                <p className="text-cricket-electric-blue text-sm font-medium">Cricket League</p>
              </div>
            </div>
            <p className="text-gray-200 text-body-small">
              The ultimate T10 tennis ball cricket league bringing together the best talent from across the nation.
              Experience cricket like never before with high-intensity matches and world-class entertainment.
            </p>
            <div className="flex space-x-2 sm:space-x-3">
              <Button size="icon" className="bg-gradient-accent text-white border-0 w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform shadow-lg">
                <Facebook className="w-3 h-3" />
              </Button>
              <Button size="icon" className="bg-gradient-sunset text-white border-0 w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform shadow-lg">
                <Twitter className="w-3 h-3" />
              </Button>
              <Button size="icon" className="bg-gradient-energy text-white border-0 w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform shadow-lg">
                <Instagram className="w-3 h-3" />
              </Button>
              <Button size="icon" className="bg-gradient-magical text-white border-0 w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform shadow-lg">
                <Youtube className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-cricket-electric-blue mb-3">About</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-xs sm:text-sm hover:translate-x-1 inline-block">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-xs sm:text-sm hover:translate-x-1 inline-block">
                  The People
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-xs sm:text-sm hover:translate-x-1 inline-block">
                  Our Partners
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-xs sm:text-sm hover:translate-x-1 inline-block">
                  Media Kit
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-xs sm:text-sm hover:translate-x-1 inline-block">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-cricket-electric-blue mb-3">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3 h-3 text-cricket-electric-blue flex-shrink-0 mt-0.5" />
                <span className="text-gray-200 text-body-small">
                  Royal Peacocks League Limited<br />
                  Courtyard by Marriott,<br />
                  1st Floor, No.564,<br />
                  Anna Salai, Teynampet,<br />
                  Tamilnadu Chennai - 600018
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-cricket-electric-blue flex-shrink-0" />
                <span className="text-gray-200 text-body-small">+91 88077 75960</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-cricket-electric-blue flex-shrink-0" />
                <span className="text-gray-200 text-body-small">info@ssplt10.co.in</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-cricket-electric-blue mb-3">How It Works</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-body-small hover:translate-x-1 inline-block">
                  Player Registration
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-body-small hover:translate-x-1 inline-block">
                  Team Selection
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-body-small hover:translate-x-1 inline-block">
                  Tournament Structure
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-body-small hover:translate-x-1 inline-block">
                  Payment Process
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-cricket-electric-blue transition-all duration-300 text-body-small hover:translate-x-1 inline-block">
                  Live Streaming
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-cricket-dark-blue">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-gray-400 text-xs text-center sm:text-left">
              © 2025 SSPL T10 Cricket League. All Rights Reserved.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-3 sm:space-x-4 text-xs">
              <TermsAndConditions asLink />
              <PrivacyPolicy asLink />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;