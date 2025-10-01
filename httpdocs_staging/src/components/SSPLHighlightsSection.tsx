import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

const SSPLHighlightsSection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const highlights = [
    {
      image: "/image_30.png",
      title: "Tournament Action",
      description: "Intense cricket moments captured live"
    },
    {
      image: "/image_13.png",
      title: "",
      description: ""
    },
    {
      image: "/image_15.png",
      title: "",
      description: ""
    },
    {
      image: "/image_29.png",
      title: "",
      description: ""
    }
  ];

  const openModal = (index) => {
    setSelectedImage(highlights[index]);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % highlights.length;
    setSelectedImage(highlights[nextIndex]);
    setCurrentImageIndex(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + highlights.length) % highlights.length;
    setSelectedImage(highlights[prevIndex]);
    setCurrentImageIndex(prevIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, currentImageIndex]);

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SSPL Highlights - Temporarily Unavailable
            </h2>
            <Camera className="w-8 h-8 text-blue-600 ml-3" />
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            News and highlights gallery is currently under maintenance. We'll be back with the latest tournament updates soon!
          </p>
        </div>

        {/* Fallback Content */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Latest News & Highlights Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              We're working on bringing you the most exciting tournament news, match highlights, and behind-the-scenes content. Stay tuned for updates on all the action from SSPL T10.
            </p>
            <div className="text-sm text-gray-500">
              Expected restoration: Once backend services are deployed
            </div>
          </div>
        </div>

        {/* Hidden layout for structure */}
        <div className="max-w-7xl mx-auto hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left Column - Single Image */}
            <div className="flex justify-center">
              <div className="relative group cursor-pointer max-w-sm" onClick={() => openModal(1)}>
                <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <img
                    src={highlights[1]?.image || "/placeholder.svg"}
                    alt={highlights[1]?.title || "SSPL Highlight"}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Featured Image (image_30) */}
            <div className="flex justify-center">
              <div className="relative group cursor-pointer max-w-md" onClick={() => openModal(0)}>
                <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <img
                    src={highlights[0]?.image || "/placeholder.svg"}
                    alt={highlights[0]?.title || "SSPL Highlight"}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold mb-2">{highlights[0]?.title || "Tournament Action"}</h3>
                    <p className="text-base opacity-90">{highlights[0]?.description || "Intense cricket moments"}</p>
                  </div>
                  <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Two Images Stacked */}
            <div className="space-y-6">
              {/* Top Image */}
              <div className="relative group cursor-pointer" onClick={() => openModal(2)}>
                <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <img
                    src={highlights[2]?.image || "/placeholder.svg"}
                    alt={highlights[2]?.title || "SSPL Highlight"}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Bottom Image */}
              <div className="relative group cursor-pointer" onClick={() => openModal(3)}>
                <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <img
                    src={highlights[3]?.image || "/placeholder.svg"}
                    alt={highlights[3]?.title || "SSPL Highlight"}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300 cursor-pointer shadow-lg hover:shadow-xl">
            <ImageIcon className="w-5 h-5" />
            <span className="font-semibold">View All Highlights</span>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Main Image */}
              <div className="relative">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Image Info */}
              <div className="mt-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
                <p className="text-gray-300 text-lg">{selectedImage.description}</p>
                <div className="mt-4 text-sm text-gray-400">
                  Image {currentImageIndex + 1} of {highlights.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SSPLHighlightsSection;