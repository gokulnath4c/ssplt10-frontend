import React from 'react';
import { Music, Play } from 'lucide-react';

const SSPLAnthemSection = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-yellow-400 mr-3" />
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              SSPL T10 Official Anthem
            </h2>
            <Music className="w-8 h-8 text-yellow-400 ml-3" />
          </div>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Experience the energy and passion of SSPL T10 through our official anthem
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-black/20 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/10">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/QrBQAv3D1cU"
                title="SSPL T10 Official Anthem"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl"
              ></iframe>
            </div>

            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <Play className="w-6 h-6 text-yellow-400" />
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-300">
                🎵 Listen to the official anthem that captures the spirit of SSPL T10
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SSPLAnthemSection;