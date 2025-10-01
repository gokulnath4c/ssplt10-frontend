import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Trophy, Calendar, X } from "lucide-react";
import { useWebsiteContent } from "@/hooks/useWebsiteContent";
import PlayerRegistrationStepper from "./PlayerRegistrationStepper";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const HeroSection = () => {
  const { getContent, loading } = useWebsiteContent();
  const [showRegistrationStepper, setShowRegistrationStepper] = useState(false);

  const heroContent = getContent('hero', {
    title: "SSPL",
    tagline: "#gully2glory",
    stats: {
      prizeMoney: "Prize Money: upto 3 Crores",
      playerPrize: "Player Prize: upto 3 Lakhs",
      finalsAt: "Finals At: Sharjah",
      franchisees: "Teams: 12"
    }
  });


  return (
    <section id="home" className="relative min-h-[70vh] sm:min-h-[80vh] w-full flex items-center bg-gradient-hero overflow-hidden mt-0 pt-0">
      {/* Clean Sporty Background */}
      <div className="absolute inset-0 sport-bg-pattern">
        {/* Hero Image */}
        <div className="absolute inset-0 hero-background" />

        {/* Subtle Animated Elements */}
        <div className="absolute inset-0 opacity-15">
          {/* Clean Floating Orbs */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-sport-electric-blue rounded-full blur-3xl sport-float"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-sport-vibrant-green rounded-full blur-3xl sport-float animation-delay-[1000ms]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-sport-energy-orange rounded-full blur-2xl sport-float animation-delay-[2000ms]"></div>

          {/* Clean Grid Lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-sport-electric-blue to-transparent sport-pulse"></div>
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-sport-vibrant-green to-transparent sport-pulse animation-delay-[500ms]"></div>
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-sport-energy-orange to-transparent sport-pulse animation-delay-[1000ms]"></div>
            <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-sport-bright-yellow to-transparent sport-pulse animation-delay-[1500ms]"></div>
          </div>
        </div>
      </div>



      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-20 pt-3 pb-3 sm:pt-4 sm:pb-4 md:pt-6 md:pb-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[60vh] sm:min-h-[70vh] md:min-h-[75vh] lg:min-h-[75vh] w-full">
          {/* Left Column - Hero Content */}
          <div className="text-left space-y-2 sm:space-y-3 md:space-y-4 flex flex-col justify-center w-full max-w-6xl mx-auto">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex flex-col items-start justify-start gap-3 mb-3 sm:mb-4 md:mb-6 w-full max-w-md">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full">
                  <Badge className="bg-[#C1E303] text-black border border-black/20 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 shadow-2xl backdrop-blur-sm hover:scale-105 transition-transform whitespace-nowrap min-h-[40px] flex items-center">
                    #gully2glory
                  </Badge>
                  <Button
                    onClick={() => setShowRegistrationStepper(true)}
                    className="sport-button text-white flex flex-row items-center justify-center w-full sm:w-auto min-w-[140px] px-3 sm:px-4 h-10 sm:h-11 rounded-md font-semibold cursor-pointer sport-hover-lift text-xs sm:text-sm min-h-[44px]"
                  >
                    <Calendar className="w-4 h-4 mr-2 sport-pulse" />
                    <span className="text-xs sm:text-sm leading-tight whitespace-normal text-center">Registrations Open Now</span>
                  </Button>
                </div>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-left break-words max-w-4xl">
                <span className="text-white block drop-shadow-2xl mb-1 sm:mb-3">
                  Southern Street Premier League
                </span>
                <span className="text-sport-electric-blue drop-shadow-2xl block text-xs sm:text-base md:text-lg lg:text-xl leading-tight tracking-wider font-bold break-words sport-pulse">
                  T10 TENNIS BALL CRICKET TOURNAMENT
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-100 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-0 drop-shadow-lg leading-relaxed break-words text-left max-w-3xl">
                Join the most exciting T10 Tennis Ball Cricket Tournament. Register yourself and compete with the best players in the league for glory and prizes.
              </p>

              {/* Chennai Trials Information */}
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-sport-energy-orange/20 border border-sport-energy-orange/40 rounded-lg backdrop-blur-sm w-full max-w-sm mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sport-bright-yellow text-lg">🏏</span>
                  <span className="text-sport-bright-yellow font-bold text-sm">NEXT SCHEDULE ON TRIALS</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  Next Schedule on Trials will be Announced soon!
                  <span className="text-sport-bright-yellow font-semibold block mt-1">Keep Checking Our Instagram Page for Further Updates.</span>
                  <span className="text-sport-bright-yellow font-semibold block mt-1">Spot Registrations Available!</span>
                </p>
              </div>
            </div>

            {/* Clean Sporty Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6 w-full max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto place-items-center" role="region" aria-label="Tournament Statistics">
              {/* Stats Card 1 - Prize Money */}
              <div className="group sport-card rounded-xl p-2 sm:p-3 md:p-4 text-center sport-glow relative overflow-hidden min-h-[120px] sm:min-h-[140px] flex flex-col justify-center" role="article" aria-label="Prize Money Information">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2 sm:mb-3 sport-bounce shadow-lg border-2 border-yellow-200" role="img" aria-label="Trophy icon">
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" aria-hidden="true" />
                  </div>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg tracking-wide">upto 3 Crores</div>
                  <div className="text-yellow-100 text-xs sm:text-sm font-bold bg-black/30 rounded-full px-2 sm:px-3 py-1 inline-block border border-yellow-300/50 shadow-lg" role="text">
                    {heroContent.stats.prizeMoney.split(':')[0]}
                  </div>
                </div>
              </div>

              {/* Stats Card 2 - Player Prize */}
              <div className="group sport-card rounded-xl p-2 sm:p-3 md:p-4 text-center sport-glow relative overflow-hidden min-h-[120px] sm:min-h-[140px] flex flex-col justify-center animation-delay-[200ms]">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2 sm:mb-3 sport-bounce shadow-lg border-2 border-green-300">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
                  </div>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg tracking-wide">upto 3 Lakhs</div>
                  <div className="text-green-100 text-xs sm:text-sm font-bold bg-black/30 rounded-full px-2 sm:px-3 py-1 inline-block border border-green-300/50 shadow-lg">
                    {heroContent.stats.playerPrize.split(':')[0]}
                  </div>
                </div>
              </div>

              {/* Stats Card 3 - Finals Venue */}
              <div className="group sport-card rounded-xl p-2 sm:p-3 md:p-4 text-center sport-glow relative overflow-hidden min-h-[120px] sm:min-h-[140px] flex flex-col justify-center animation-delay-[400ms]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2 sm:mb-3 sport-bounce shadow-lg border-2 border-blue-300">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
                  </div>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg tracking-wide">Sharjah</div>
                  <div className="text-cyan-100 text-xs sm:text-sm font-bold bg-black/30 rounded-full px-2 sm:px-3 py-1 inline-block border border-cyan-300/50 shadow-lg">
                    {heroContent.stats.finalsAt.split(':')[0]}
                  </div>
                </div>
              </div>

              {/* Stats Card 4 - Teams */}
              <div className="group sport-card rounded-xl p-2 sm:p-3 md:p-4 text-center sport-glow relative overflow-hidden min-h-[120px] sm:min-h-[140px] flex flex-col justify-center animation-delay-[600ms]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-green-500 to-teal-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="bg-gradient-to-br from-orange-400 to-green-500 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2 sm:mb-3 sport-bounce shadow-lg border-2 border-orange-300">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
                  </div>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg tracking-wide">12</div>
                  <div className="text-orange-100 text-xs sm:text-sm font-bold bg-black/30 rounded-full px-2 sm:px-3 py-1 inline-block border border-orange-300/50 shadow-lg">
                    Teams
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Dialog open={showRegistrationStepper} onOpenChange={setShowRegistrationStepper}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <img src="/ssplt10-logo.png" alt="SSPL Logo" className="w-20 h-20 mx-auto mb-2" />
              Player Registration
            </DialogTitle>
            <DialogDescription className="text-center">
              Register as a player for the SSPL T10 tournament. Fill out the form below to join the league and compete for prizes.
            </DialogDescription>
          </DialogHeader>
          <PlayerRegistrationStepper />
        </DialogContent>
      </Dialog>

    </section>
  );
};

export default HeroSection;
