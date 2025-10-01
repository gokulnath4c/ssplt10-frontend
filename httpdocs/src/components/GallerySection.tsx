import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Calendar, QrCode } from "lucide-react";
import { QRCodeService } from "@/services/qrCodeService";
import { useState, useEffect } from "react";

const GallerySection = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    // Load QR codes when component mounts
    loadQRCodes();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === galleryItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? galleryItems.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // 4 seconds for gallery

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

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
    <section id="gallery" className="py-12 sm:py-16 lg:py-20 bg-cricket-light-blue">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Official Anthem Section */}
        <div className="text-center mb-12 lg:mb-16">
          <Badge className="bg-cricket-yellow text-cricket-blue mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            Official Content
          </Badge>
          <h2 className="text-clamp-4xl font-bold text-cricket-blue mb-4 lg:mb-6">
            SSPL T10 <span className="text-cricket-yellow">Official Anthem</span>
          </h2>
          <p className="text-clamp-base text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
            Experience the passion and energy of SSPL T10 through our official anthem
          </p>

          {/* Featured Video */}
          <Card className="max-w-4xl mx-auto shadow-card overflow-hidden">
            <div className="relative aspect-video bg-gradient-hero flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 text-center text-white">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cricket-yellow rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-cricket-blue ml-1" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold mb-2">SSPL T10 Official Anthem</h3>
                <p className="text-cricket-yellow text-sm sm:text-base">Click to watch the official anthem</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Highlights Section */}
        <div className="mb-12 lg:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-clamp-3xl font-bold text-cricket-blue mb-4">
              SSPL Highlights
            </h3>
            <p className="text-clamp-sm text-muted-foreground px-4">
              Relive the most exciting moments from the tournament
            </p>
          </div>

          <div className="grid grid-breakpoint-1 sm:grid-breakpoint-2 lg:grid-breakpoint-3 gap-4 sm:gap-6">
            {galleryItems.slice(0, 6).map((item) => {
              // Fix srcset construction by properly encoding URLs
              const encodeSrcSetUrl = (url: string) => encodeURIComponent(url);

              const avifSrcSet = `${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '.avif'))} 1x, ${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '@2x.avif'))} 2x`;
              const webpSrcSet = `${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '.webp'))} 1x, ${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '@2x.webp'))} 2x`;
              const fallbackSrcSet = `${encodeSrcSetUrl(item.thumbnail)} 1x, ${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '@2x.jpg'))} 2x`;

              // Debug logging to validate srcset parsing
              console.log('🔍 GallerySection srcset debug:', {
                originalThumbnail: item.thumbnail,
                avifSrcSet,
                webpSrcSet,
                fallbackSrcSet,
                hasSpaces: item.thumbnail.includes(' '),
                encodedThumbnail: encodeSrcSetUrl(item.thumbnail)
              });

              return (
                <Card key={item.id} className="group hover:shadow-card transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                  <div className="relative aspect-video">
                    <picture>
                      <source
                        srcSet={avifSrcSet}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        type="image/avif"
                      />
                      <source
                        srcSet={webpSrcSet}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        type="image/webp"
                      />
                      <img
                        src={item.thumbnail}
                        srcSet={fallbackSrcSet}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          // Fallback for broken images
                          console.warn('❌ Gallery image failed to load:', item.thumbnail);
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </picture>

                    {/* Video Play Button */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors duration-300">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cricket-yellow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-4 h-4 sm:w-6 sm:h-6 text-cricket-blue ml-0.5 sm:ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Duration Badge for Videos */}
                    {item.duration && (
                      <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
                        {item.duration}
                      </Badge>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h4 className="font-semibold text-sm sm:text-base">{item.title}</h4>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Auto-Scrolling Gallery Section */}
        <div className="mb-12 lg:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-clamp-3xl font-bold text-cricket-blue mb-4">
              Auto-Scrolling Gallery
            </h3>
            <p className="text-clamp-sm text-muted-foreground px-4">
              Watch our memorable moments scroll by automatically
            </p>
          </div>

          {/* Gallery carousel container */}
          <div className="relative overflow-hidden bg-gradient-to-r from-cricket-light-blue/20 to-cricket-light-blue/10 rounded-lg p-4 w-full" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {galleryItems.map((item, index) => (
                <div key={`gallery-${index}`} className="w-full flex-shrink-0">
                  <div className="flex justify-center">
                    <div className="w-48 sm:w-64">
                      <Card className="group hover:shadow-card transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden h-32">
                        <div className="relative w-full h-full">
                          <picture>
                            <source
                              srcSet={`${encodeURIComponent(item.thumbnail.replace('.jpg', '.avif'))} 1x, ${encodeURIComponent(item.thumbnail.replace('.jpg', '@2x.avif'))} 2x`}
                              sizes="200px"
                              type="image/avif"
                            />
                            <source
                              srcSet={`${encodeURIComponent(item.thumbnail.replace('.jpg', '.webp'))} 1x, ${encodeURIComponent(item.thumbnail.replace('.jpg', '@2x.webp'))} 2x`}
                              sizes="200px"
                              type="image/webp"
                            />
                            <img
                              src={item.thumbnail}
                              srcSet={`${encodeURIComponent(item.thumbnail)} 1x, ${encodeURIComponent(item.thumbnail.replace('.jpg', '@2x.jpg'))} 2x`}
                              sizes="200px"
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                console.warn('❌ Gallery image failed to load:', item.thumbnail);
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </picture>
                          {/* Video Play Button */}
                          {item.type === "video" && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors duration-300">
                              <div className="w-8 h-8 bg-cricket-yellow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Play className="w-3 h-3 text-cricket-blue" />
                              </div>
                            </div>
                          )}
                          {/* Duration Badge for Videos */}
                          {item.duration && (
                            <Badge className="absolute bottom-1 right-1 bg-black/80 text-white text-xs">
                              {item.duration}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation arrows - Enhanced visibility */}
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-md border-2 border-cricket-blue/50 rounded-full flex items-center justify-center text-cricket-blue hover:bg-cricket-blue hover:text-white shadow-lg hover:shadow-cricket-blue/50 transition-all duration-300 hover:scale-110 z-10"
              onClick={prevSlide}
              aria-label="Previous gallery item"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-md border-2 border-cricket-blue/50 rounded-full flex items-center justify-center text-cricket-blue hover:bg-cricket-blue hover:text-white shadow-lg hover:shadow-cricket-blue/50 transition-all duration-300 hover:scale-110 z-10"
              onClick={nextSlide}
              aria-label="Next gallery item"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {galleryItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-cricket-blue scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to gallery item ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Static Gallery Grid */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-clamp-3xl font-bold text-cricket-blue mb-4">
            SSPL Gallery
          </h3>
          <p className="text-clamp-sm text-muted-foreground mb-6 sm:mb-8 px-4">
            Explore our collection of memorable moments and behind-the-scenes content
          </p>
        </div>

        <div className="grid grid-breakpoint-2 sm:grid-breakpoint-3 lg:grid-breakpoint-6 gap-2 sm:gap-4">
           {galleryItems.map((item) => {
             // Fix srcset construction by properly encoding URLs
             const encodeSrcSetUrl = (url: string) => encodeURIComponent(url);

             const avifSrcSet = `${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '.avif'))} 1x, ${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '@2x.avif'))} 2x`;
             const webpSrcSet = `${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '.webp'))} 1x, ${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '@2x.webp'))} 2x`;
             const fallbackSrcSet = `${encodeSrcSetUrl(item.thumbnail)} 1x, ${encodeSrcSetUrl(item.thumbnail.replace('.jpg', '@2x.jpg'))} 2x`;

             return (
               <Card key={`gallery-${item.id}`} className="aspect-square group hover:shadow-card transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                 <div className="relative w-full h-full">
                   <picture>
                     <source
                       srcSet={avifSrcSet}
                       sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                       type="image/avif"
                     />
                     <source
                       srcSet={webpSrcSet}
                       sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                       type="image/webp"
                     />
                     <img
                       src={item.thumbnail}
                       srcSet={fallbackSrcSet}
                       sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                       alt={item.title}
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                       loading="lazy"
                       decoding="async"
                       onError={(e) => {
                         // Fallback for broken images
                         console.warn('❌ Gallery grid image failed to load:', item.thumbnail);
                         e.currentTarget.src = "/placeholder.svg";
                       }}
                     />
                   </picture>
                   <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-70 transition-opacity duration-300 flex items-center justify-center">
                     <ExternalLink className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                   </div>
                 </div>
               </Card>
             );
           })}
        </div>

        {/* QR Codes Section */}
        {qrCodes.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="bg-cricket-blue text-cricket-yellow mb-4">
                <QrCode className="w-4 h-4 mr-2" />
                Digital Access
              </Badge>
              <h3 className="text-clamp-3xl font-bold text-cricket-blue mb-4">
                QR Code Gallery
              </h3>
              <p className="text-clamp-sm text-muted-foreground px-4">
                Scan QR codes for instant access to registration and tournament information
              </p>
            </div>

            <div className="grid grid-breakpoint-1 sm:grid-breakpoint-2 lg:grid-breakpoint-3 gap-4 sm:gap-6">
              {qrCodes.slice(0, 6).map((qrCode) => (
                <Card key={`qr-${qrCode.id}`} className="group hover:shadow-card transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                  <div className="relative aspect-square bg-gradient-to-br from-cricket-blue to-cricket-light-blue flex items-center justify-center p-6">
                    {/* QR Code Display */}
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <img
                        src={qrCode.qrDataUrl}
                        alt={`QR Code for ${qrCode.title}`}
                        className="w-32 h-32"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    {/* Scan Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/80 transition-colors duration-300 opacity-0 group-hover:opacity-100">
                      <div className="text-center text-white">
                        <QrCode className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Scan to Access</p>
                        <p className="text-xs opacity-80">{qrCode.title}</p>
                      </div>
                    </div>

                    {/* Scan Count Badge */}
                    <Badge className="absolute top-2 right-2 bg-cricket-yellow text-cricket-blue text-xs">
                      {qrCode.currentScans} scans
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-1">{qrCode.title}</h4>
                    {qrCode.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {qrCode.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(qrCode.createdAt).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
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
                  className="border-cricket-blue text-cricket-blue hover:bg-cricket-blue hover:text-white"
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
          <Button className="bg-cricket-yellow text-cricket-blue hover:bg-yellow-400 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Complete Gallery
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;