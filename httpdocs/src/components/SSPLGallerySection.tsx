import React, { useState, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';

const SSPLGallerySection = () => {
  console.log('🏛️ SSPL Gallery Section rendering...');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
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

  // Mobile animation fix utility
  useEffect(() => {
    const forceMobileAnimations = () => {
      const animations = ['.animate-marquee-gallery'];

      animations.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;
          // Force animation restart on mobile
          if (window.innerWidth <= 599) {
            htmlElement.style.animationPlayState = 'running';
            htmlElement.style.webkitAnimationPlayState = 'running';
          }
        });
      });
    };

    // Run immediately and after delays
    forceMobileAnimations();
    setTimeout(forceMobileAnimations, 1000);
    setTimeout(forceMobileAnimations, 3000);

    // Set up periodic checks for mobile
    if (window.innerWidth <= 599) {
      const interval = setInterval(forceMobileAnimations, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  // Gallery images from the public/Gallery folder
  const galleryImages = [
    { src: "/Gallery/image_17.png", alt: "SSPL Gallery Image 17" },
    { src: "/Gallery/image_19.png", alt: "SSPL Gallery Image 19" },
    { src: "/Gallery/image_21.png", alt: "SSPL Gallery Image 21" },
    { src: "/Gallery/image_25.png", alt: "SSPL Gallery Image 25" },
    { src: "/Gallery/image_26.png", alt: "SSPL Gallery Image 26" },
    { src: "/Gallery/image_27.png", alt: "SSPL Gallery Image 27" },
    { src: "/Gallery/image_28.png", alt: "SSPL Gallery Image 28" },
    { src: "/Gallery/image_52.png", alt: "SSPL Gallery Image 52" }
  ];

  console.log('📸 Gallery images:', galleryImages);

  return (
    <section className="py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-indigo-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SSPL Gallery
            </h2>
            <Camera className="w-8 h-8 text-indigo-600 ml-3" />
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore the vibrant moments and memories from the SSPL T10 tournament
          </p>
        </div>

        {/* Gallery Carousel */}
        <div className="relative overflow-hidden w-full" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {galleryImages.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <div className="flex justify-center items-center py-8">
                  <div className="w-48 h-32 md:w-56 md:h-36 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        console.log('Gallery image failed to load:', image.src);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows - Enhanced visibility with better contrast */}
          <button
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md border-2 border-indigo-500/50 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-110 z-10"
            onClick={prevSlide}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md border-2 border-indigo-500/50 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-110 z-10"
            onClick={nextSlide}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SSPLGallerySection;