import React from 'react';
import { Camera } from 'lucide-react';
import { PremiumFloatingElements } from '@/components/PremiumFloatingElements';
import { useScrollAnimation, scrollAnimationPresets } from '@/hooks/useScrollAnimation';

const SSPLGallerySection = () => {
  const gallerySectionRef = useScrollAnimation({
    ...scrollAnimationPresets.fadeInUp,
    delay: 200
  });

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

  return (
    <section className="relative py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Premium Floating Elements */}
      <PremiumFloatingElements variant="minimal" className="opacity-20" />

      <div ref={gallerySectionRef.ref as any} className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

        {/* Marquee Container */}
        <div className="relative">
          {/* First marquee row */}
          <div className="flex animate-marquee-gallery">
            {galleryImages.concat(galleryImages).map((image, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 mx-3 group cursor-pointer"
              >
                <div className="w-48 h-32 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee animations will be handled by CSS classes */}
      </div>
    </section>
  );
};

export default SSPLGallerySection;