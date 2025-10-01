import { useState, useEffect } from "react";

const OurPartnersSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === partnerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? partnerImages.length - 1 : prevIndex - 1
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
    }, 3000); // 3 seconds for partners

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const partnerImages = [
    "/Our-Sponsors/Comentary Box.png",
    "/Our-Sponsors/Edge media.png",
    "/Our-Sponsors/Equitas Bank.png",
    "/Our-Sponsors/Football Makka.png",
    "/Our-Sponsors/I Merge.png",
    "/Our-Sponsors/Lions International .png",
    "/Our-Sponsors/Malai Murasu.png",
    "/Our-Sponsors/Odi Vilayadu Papa.png",
    "/Our-Sponsors/Play O - Png.png",
    "/Our-Sponsors/Radio city.png",
    "/Our-Sponsors/Reflect Media.png",
    "/Our-Sponsors/Royal Peacocks .png",
    "/Our-Sponsors/Sixit.png",
    "/Our-Sponsors/Turf Town .png"
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-sport-green mb-4">
            Our Partners
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Proud to be associated with these esteemed organizations
          </p>
        </div>

        {/* Partners Carousel */}
        <div className="relative overflow-hidden w-full" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {partnerImages.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <div className="flex justify-center items-center py-8">
                  <div className="w-40 h-20 md:w-48 md:h-24 bg-white rounded-lg shadow-md flex items-center justify-center p-2 hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={image}
                      alt={`Partner ${index + 1}`}
                      className="max-w-full max-h-full object-contain transition-all duration-300 hover:scale-105"
                      onError={(e) => {
                        // Hide broken images gracefully
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows - Enhanced visibility with better contrast */}
          <button
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 md:bg-white/20 backdrop-blur-md border-2 border-sport-orange/50 md:border-white/30 rounded-full flex items-center justify-center text-sport-orange md:text-white hover:bg-sport-orange hover:text-white md:hover:bg-white/30 shadow-lg hover:shadow-sport-orange/50 transition-all duration-300 hover:scale-110 z-10"
            onClick={prevSlide}
            aria-label="Previous partner"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 md:bg-white/20 backdrop-blur-md border-2 border-sport-orange/50 md:border-white/30 rounded-full flex items-center justify-center text-sport-orange md:text-white hover:bg-sport-orange hover:text-white md:hover:bg-white/30 shadow-lg hover:shadow-sport-orange/50 transition-all duration-300 hover:scale-110 z-10"
            onClick={nextSlide}
            aria-label="Next partner"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

       {/* Optional: Add a call-to-action or additional content */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Interested in partnering with us? <a href="/contact" className="text-sport-orange hover:underline">Get in touch</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default OurPartnersSection;