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
    <footer
      id="contact"
      className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white relative overflow-hidden"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary-400 rounded-full blur-3xl"></div>
      </div>
      {/* Main Footer Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {/* About Section */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <img
                src="/ssplt10-logo.png?v=1.0"
                alt="SSPL T10 Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">SSPL T10</h3>
                <p className="text-accent-300 text-sm font-medium">Cricket League</p>
              </div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">
              The ultimate T10 tennis ball cricket league bringing together the best talent from across the nation.
              Experience cricket like never before with high-intensity matches and world-class entertainment.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <Button size="icon" className="bg-accent-500 hover:bg-accent-400 text-white border-0 w-10 h-10 sm:w-12 sm:h-12 hover:scale-110 transition-all duration-300 shadow-premium">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button size="icon" className="bg-secondary-500 hover:bg-secondary-400 text-white border-0 w-10 h-10 sm:w-12 sm:h-12 hover:scale-110 transition-all duration-300 shadow-premium">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button size="icon" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white border-0 w-10 h-10 sm:w-12 sm:h-12 hover:scale-110 transition-all duration-300 shadow-premium">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button size="icon" className="bg-error-500 hover:bg-error-400 text-white border-0 w-10 h-10 sm:w-12 sm:h-12 hover:scale-110 transition-all duration-300 shadow-premium">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-accent-300 mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  The People
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Our Partners
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Media Kit
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-accent-300 mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-accent-300 flex-shrink-0 mt-1" />
                <span className="text-gray-200 text-sm leading-relaxed">
                  Royal Peacocks League Limited<br />
                  Courtyard by Marriott,<br />
                  1st Floor, No.564,<br />
                  Anna Salai, Teynampet,<br />
                  Tamilnadu Chennai - 600018
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-accent-300 flex-shrink-0" />
                <span className="text-gray-200 text-sm font-medium">+91 88077 75960</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-accent-300 flex-shrink-0" />
                <span className="text-gray-200 text-sm font-medium">info@ssplt10.co.in</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-accent-300 mb-4">How It Works</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Player Registration
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Team Selection
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Tournament Structure
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Payment Process
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-accent-300 transition-all duration-300 text-sm hover:translate-x-1 inline-block font-medium">
                  Live Streaming
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-primary-700">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-gray-400 text-xs sm:text-sm text-center sm:text-left font-medium">
              © 2025 SSPL T10 Cricket League. All Rights Reserved.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-3 sm:space-x-4 md:space-x-6 text-xs sm:text-sm">
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