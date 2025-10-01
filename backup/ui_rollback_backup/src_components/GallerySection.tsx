import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Calendar, QrCode } from "lucide-react";
import { QRCodeService } from "@/services/qrCodeService";
import { useState, useEffect } from "react";
import { useScrollAnimation, scrollAnimationPresets } from "@/hooks/useScrollAnimation";
import { PremiumFloatingElements } from "@/components/PremiumFloatingElements";
import { hoverEffects, glassmorphismConfigs, shadowConfigs } from "@/utils/animationUtils";

const GallerySection = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [showQRCodes, setShowQRCodes] = useState(false);

  // Scroll animations for different sections
  const anthemSectionRef = useScrollAnimation({
    ...scrollAnimationPresets.fadeInUp,
    delay: 200
  });

  const highlightsSectionRef = useScrollAnimation({
    ...scrollAnimationPresets.fadeInUp,
    delay: 400
  });

  const galleryGridRef = useScrollAnimation({
    ...scrollAnimationPresets.fadeInUp,
    delay: 600
  });

  const qrSectionRef = useScrollAnimation({
    ...scrollAnimationPresets.fadeInUp,
    delay: 800
  });

  useEffect(() => {
    // Load QR codes when component mounts
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      const result = await QRCodeService.getQRCodes({ limit: 6 });
      setQrCodes(result.qrCodes.filter(qr => qr.isActive));
    } catch (error) {
      console.error('Error loading QR codes:', error);
    }
  };

  // Mock gallery items
  const galleryItems = [
    {
      id: 1,
      type: "video",
      title: "SSPL T10 Official Anthem",
      thumbnail: "/gallery/anthem-thumbnail.jpg",
      duration: "3:45"
    },
    {
      id: 2,
      type: "image",
      title: "Championship Trophy",
      thumbnail: "/gallery/trophy.jpg"
    },
    {
      id: 3,
      type: "video", 
      title: "Player Highlights",
      thumbnail: "/gallery/player-highlights.jpg",
      duration: "2:30"
    },
    {
      id: 4,
      type: "image",
      title: "Team Celebrations",
      thumbnail: "/gallery/team-celebrations.jpg"
    },
    {
      id: 5,
      type: "video",
      title: "Match Highlights",
      thumbnail: "/gallery/match-highlights.jpg",
      duration: "4:15"
    },
    {
      id: 6,
      type: "image",
      title: "Behind the Scenes",
      thumbnail: "/gallery/behind-scenes.jpg"
    }
  ];

  return (
    <section id="gallery" className="relative py-12 sm:py-16 lg:py-20 bg-cricket-light-blue overflow-hidden">
      {/* Premium Floating Elements */}
      <PremiumFloatingElements variant="moderate" className="opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Official Anthem Section */}
        <div ref={anthemSectionRef.ref as any} className="text-center mb-12 lg:mb-16">
          <Badge className="bg-cricket-yellow text-cricket-blue mb-4 hover:scale-105 transition-transform duration-300 shadow-premium">
            <Calendar className="w-4 h-4 mr-2" />
            Official Content
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cricket-blue mb-4 lg:mb-6">
            SSPL T10 <span className="text-cricket-yellow bg-gradient-to-r from-cricket-yellow to-cricket-gold bg-clip-text text-transparent">Official Anthem</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
            Experience the passion and energy of SSPL T10 through our official anthem
          </p>

          {/* Featured Video */}
          <Card className="max-w-4xl mx-auto shadow-premium overflow-hidden group hover:shadow-float transition-all duration-500">
            <div className="relative aspect-video bg-gradient-hero flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

              {/* Premium floating elements for video */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-2 h-2 bg-cricket-yellow rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-cricket-electric-blue rounded-full animate-bounce" style={{ animationDelay: '500ms' }}></div>
                <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-cricket-gold rounded-full animate-bounce" style={{ animationDelay: '1000ms' }}></div>
                <div className="absolute bottom-8 right-4 w-1 h-1 bg-cricket-purple rounded-full animate-bounce" style={{ animationDelay: '1500ms' }}></div>
              </div>

              <div className="relative z-10 text-center text-white">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cricket-yellow rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-glow border-2 border-cricket-gold/30">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-cricket-blue ml-1 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold mb-2 group-hover:text-cricket-yellow transition-colors duration-300">SSPL T10 Official Anthem</h3>
                <p className="text-cricket-yellow text-sm sm:text-base group-hover:scale-105 transition-transform duration-300">Click to watch the official anthem</p>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </div>
          </Card>
        </div>

        {/* Highlights Section */}
        <div ref={highlightsSectionRef.ref as any} className="mb-12 lg:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cricket-blue mb-4">
              SSPL <span className="bg-gradient-to-r from-cricket-electric-blue to-cricket-purple bg-clip-text text-transparent">Highlights</span>
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Relive the most exciting moments from the tournament
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {galleryItems.slice(0, 6).map((item, index) => (
              <Card
                key={item.id}
                className="group hover:shadow-float transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden glass-card border-white/20"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="relative aspect-video">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Premium floating particles */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-2 left-2 w-1 h-1 bg-cricket-yellow rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-cricket-electric-blue rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                    <div className="absolute bottom-2 left-4 w-1 h-1 bg-cricket-gold rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>

                  {/* Video Play Button */}
                  {item.type === "video" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all duration-500">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cricket-yellow rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-glow border-2 border-cricket-gold/30">
                        <Play className="w-4 h-4 sm:w-6 sm:h-6 text-cricket-blue ml-0.5 sm:ml-1 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  )}

                  {/* Duration Badge for Videos */}
                  {item.duration && (
                    <Badge className="absolute bottom-2 right-2 bg-black/90 text-white text-xs hover:bg-cricket-yellow hover:text-cricket-blue transition-colors duration-300 shadow-premium">
                      {item.duration}
                    </Badge>
                  )}

                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cricket-electric-blue/20 via-transparent to-cricket-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <h4 className="font-semibold text-sm sm:text-base group-hover:text-cricket-yellow transition-colors duration-300">{item.title}</h4>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div ref={galleryGridRef.ref as any} className="text-center mb-8 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cricket-blue mb-4">
            SSPL <span className="bg-gradient-to-r from-cricket-gold to-cricket-orange bg-clip-text text-transparent">Gallery</span>
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-4">
            Explore our collection of memorable moments and behind-the-scenes content
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {galleryItems.map((item, index) => (
            <Card
              key={`gallery-${item.id}`}
              className="aspect-square group hover:shadow-float transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden glass-card border-white/20"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <div className="relative w-full h-full">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Premium floating elements */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-1 left-1 w-1 h-1 bg-cricket-yellow rounded-full animate-ping"></div>
                  <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-cricket-electric-blue rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                  <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-cricket-gold rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="absolute bottom-1 right-1 w-1 h-1 bg-cricket-purple rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-cricket-electric-blue/30 via-transparent to-cricket-purple/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ExternalLink className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* QR Codes Section */}
        {qrCodes.length > 0 && (
          <div ref={qrSectionRef.ref as any} className="mt-12 lg:mt-16">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-cricket-blue text-cricket-yellow mb-4 hover:scale-105 transition-transform duration-300 shadow-premium">
                <QrCode className="w-4 h-4 mr-2" />
                Digital Access
              </Badge>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cricket-blue mb-4">
                QR Code <span className="bg-gradient-to-r from-cricket-electric-blue to-cricket-purple bg-clip-text text-transparent">Gallery</span>
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Scan QR codes for instant access to registration and tournament information
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {qrCodes.slice(0, 6).map((qrCode, index) => (
                <Card
                  key={`qr-${qrCode.id}`}
                  className="group hover:shadow-float transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden glass-card border-white/20"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-cricket-blue to-cricket-light-blue flex items-center justify-center p-6">
                    {/* QR Code Display */}
                    <div className="bg-white p-4 rounded-lg shadow-premium hover:shadow-float transition-all duration-300 group-hover:scale-105">
                      <img
                        src={qrCode.qrDataUrl}
                        alt={`QR Code for ${qrCode.title}`}
                        className="w-32 h-32"
                      />
                    </div>

                    {/* Premium floating elements */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-2 left-2 w-1 h-1 bg-cricket-yellow rounded-full animate-ping"></div>
                      <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-cricket-electric-blue rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-cricket-gold rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      <div className="absolute bottom-2 right-2 w-0.5 h-0.5 bg-cricket-purple rounded-full animate-ping" style={{ animationDelay: '600ms' }}></div>
                    </div>

                    {/* Scan Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/80 transition-all duration-500 opacity-0 group-hover:opacity-100">
                      <div className="text-center text-white">
                        <div className="w-12 h-12 bg-cricket-yellow rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-glow">
                          <QrCode className="w-6 h-6 text-cricket-blue" />
                        </div>
                        <p className="text-sm font-medium group-hover:text-cricket-yellow transition-colors duration-300">Scan to Access</p>
                        <p className="text-xs opacity-80 group-hover:opacity-100 transition-opacity duration-300">{qrCode.title}</p>
                      </div>
                    </div>

                    {/* Scan Count Badge */}
                    <Badge className="absolute top-2 right-2 bg-cricket-yellow text-cricket-blue text-xs hover:bg-yellow-400 hover:text-cricket-blue transition-colors duration-300 shadow-premium">
                      {qrCode.currentScans} scans
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-1 group-hover:text-cricket-blue transition-colors duration-300">{qrCode.title}</h4>
                    {qrCode.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors duration-300">
                        {qrCode.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(qrCode.createdAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-cricket-blue hover:text-white transition-colors duration-300">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {qrCodes.length > 6 && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowQRCodes(!showQRCodes)}
                  className="border-cricket-blue text-cricket-blue hover:bg-cricket-blue hover:text-white hover:scale-105 transition-all duration-300 shadow-premium"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQRCodes ? 'Hide' : 'Show'} All QR Codes ({qrCodes.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* View More Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Button className="bg-gradient-to-r from-cricket-yellow to-cricket-gold text-cricket-blue hover:scale-105 hover:shadow-glow px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 shadow-premium border-2 border-cricket-gold/30">
            <ExternalLink className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            View Complete Gallery
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;