import React from 'react';
import { Trophy, Users, Target, Zap, MapPin, Globe, Building2, Calendar, Clock } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const LeagueHighlightsSection = () => {
  const highlights = [
    {
      type: "image",
      image: "/image_8.png",
      title: "Celeb Patron",
      description: ""
    },
    {
      icon: Globe,
      title: "6 States",
      description: ""
    },
    {
      icon: Building2,
      title: "12 Franchisees",
      description: ""
    },
    {
      icon: Trophy,
      title: "Final's at Sharjah",
      description: ""
    },
    {
      icon: Calendar,
      title: "4 Weeks",
      description: ""
    },
    {
      icon: Users,
      title: "300 Players",
      description: ""
    }
  ];

  return (
    <section className="py-6 bg-gradient-to-br from-cricket-blue via-cricket-dark-blue to-cricket-purple text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-black mb-2 bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">
            League Highlights - Temporarily Unavailable
          </h2>
          <p className="text-sm md:text-base text-gray-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Match schedules and league information are currently under maintenance. We'll be back with exciting updates soon!
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-md p-6 border border-white/20">
            <div className="text-4xl mb-4">🏏</div>
            <h3 className="text-lg font-bold text-white mb-2">Coming Back Soon!</h3>
            <p className="text-gray-200 text-sm mb-4">
              We're updating our match scheduling and league highlights system. Stay tuned for the latest tournament information.
            </p>
            <div className="text-xs text-gray-300">
              Expected restoration: Once backend services are deployed
            </div>
          </div>
        </div>

        {/* Hidden carousel for structure */}
        <div className="max-w-2xl mx-auto hidden">
          <Carousel
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {highlights.map((highlight, index) => {
                if (highlight.type === "image") {
                  return (
                    <CarouselItem key={index} className="pl-1 md:pl-2 md:basis-1/2 lg:basis-1/3">
                      <div className="group bg-white/10 backdrop-blur-sm rounded-md p-1.5 hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl border border-white/20 aspect-square max-w-28 mx-auto">
                        <div className="flex flex-col items-center text-center space-y-1 h-full">
                          <div className="w-full flex-1 rounded-md overflow-hidden bg-white/20 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <img
                              src={highlight.image}
                              alt={highlight.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors duration-300 leading-tight">
                            {highlight.title}
                          </h3>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                }

                const IconComponent = highlight.icon;
                return (
                  <CarouselItem key={index} className="pl-1 md:pl-2 md:basis-1/2 lg:basis-1/3">
                    <div className="group bg-white/10 backdrop-blur-sm rounded-md p-1.5 hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl border border-white/20 aspect-square max-w-28 mx-auto">
                      <div className="flex flex-col items-center justify-center text-center space-y-1 h-full">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-1.5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors duration-300 leading-tight">
                          {highlight.title}
                        </h3>
                        <p className="text-gray-200 text-xs leading-tight">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

      </div>
    </section>
  );
};

export default LeagueHighlightsSection;