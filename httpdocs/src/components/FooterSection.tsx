import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
import "./FooterSection.css";

const FooterSection = () => {
  return (
    <footer
      id="contact"
      className="footer-sporty footer-animate-in"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/ssplt10-logo.png?v=1.0"
                alt="SSPL T10 Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain filter brightness-110"
              />
              <div>
                <h3 className="footer-heading text-2xl sm:text-3xl font-bold">SSPL T10</h3>
                <p className="text-teal-400 text-sm font-semibold tracking-wide uppercase">CRICKET LEAGUE</p>
              </div>
            </div>
            <p className="footer-body text-sm sm:text-base leading-relaxed max-w-md">
              The ultimate T10 tennis ball cricket league bringing together the best talent from across the nation.
              Experience cricket like never before with high-intensity matches and world-class entertainment.
            </p>
            
            {/* Social Media Section */}
            <div className="space-y-3">
              <h4 className="footer-heading text-base sm:text-lg">Follow Us</h4>
              <div className="flex space-x-3" aria-label="Social media links">
                <a
                  href="https://facebook.com/ssplt10"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                >
                  <Button
                    size="icon"
                    className="footer-social-btn w-10 h-10 sm:w-12 sm:h-12 footer-transition hover:bg-blue-600"
                  >
                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </a>
                <a
                  href="https://twitter.com/ssplt10"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Twitter"
                >
                  <Button
                    size="icon"
                    className="footer-social-btn w-10 h-10 sm:w-12 sm:h-12 footer-transition hover:bg-sky-500"
                  >
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </a>
                <a
                  href="https://instagram.com/ssplt10"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  <Button
                    size="icon"
                    className="footer-social-btn w-10 h-10 sm:w-12 sm:h-12 footer-transition hover:bg-pink-600"
                  >
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </a>
                <a
                  href="https://youtube.com/ssplt10"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Button
                    size="icon"
                    className="footer-social-btn w-10 h-10 sm:w-12 sm:h-12 footer-transition hover:bg-red-600"
                  >
                    <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="footer-heading text-base sm:text-lg mb-4">Quick Links</h4>
            <nav role="navigation" aria-label="Footer navigation">
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/teams" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    Teams & Standings
                  </Link>
                </li>
                <li>
                  <Link to="/players" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    Players & Stats
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    Gallery
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="footer-heading text-base sm:text-lg mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="footer-contact-icon w-4 h-4 mt-1 flex-shrink-0" aria-hidden="true" />
                <address className="footer-contact-text text-sm sm:text-base not-italic">
                  Royal Peacocks League Limited<br />
                  Courtyard by Marriott,<br />
                  1st Floor, No.564,<br />
                  Anna Salai, Teynampet,<br />
                  Tamilnadu Chennai - 600018
                </address>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="footer-contact-icon w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <a
                  href="tel:+918807775960"
                  className="footer-contact-text text-sm sm:text-base hover:text-teal-400 transition-colors"
                >
                  +91 88077 75960
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="footer-contact-icon w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <a
                  href="mailto:info@ssplt10.co.in"
                  className="footer-contact-text text-sm sm:text-base hover:text-teal-400 transition-colors"
                >
                  info@ssplt10.co.in
                </a>
              </div>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="space-y-4">
            <h4 className="footer-heading text-base sm:text-lg mb-4">Tournament</h4>
            <nav role="navigation" aria-label="Tournament information">
              <ul className="space-y-2">
                <li>
                  <Link to="/register" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    Player Registration
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/enquiry" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    Enquiry
                  </Link>
                </li>
                <li>
                  <a href="#contact" className="footer-link text-sm sm:text-base footer-transition inline-block">
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="footer-copyright text-xs sm:text-sm text-center sm:text-left">
              © 2025 SSPL T10 Cricket League. All Rights Reserved.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm">
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