import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Trophy, Calendar } from "lucide-react";
import { useWebsiteContent } from "@/hooks/useWebsiteContent";
import PlayerRegistrationStepper from "./PlayerRegistrationStepper";
import React, { useState } from "react";
import { Link } from "react-router-dom";
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
    <main id="main-content">
      <section id="home" className="relative w-full overflow-visible mt-0 pt-0 z-10">
      {/* Desktop Hero Layout - Full Width Background with Content Overlay */}
      <div className="hidden lg:block">
        <div className="relative min-h-[100vh] w-full overflow-hidden">
          {/* Full Width Background Image with Dark Gradient Overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 hero-background" />
            {/* Very light gradient overlay for improved text contrast and brighter background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-black/10" />
          </div>

          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-sport-teal rounded-full blur-3xl animate-pulse animation-duration-[8000ms]"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-sport-orange rounded-full blur-3xl animate-pulse animation-delay-[1000ms] animation-duration-[8000ms]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-sport-gold rounded-full blur-2xl animate-pulse animation-delay-[2000ms] animation-duration-[8000ms]"></div>
          </div>

          {/* Cricket Background SVG */}
          <img src="/assets/svg/ball-arc.svg" alt="" className="absolute inset-0 w-full h-full object-contain opacity-15 transform rotate-45" aria-hidden="true" style={{ zIndex: 1 }} />

          {/* Desktop Content - Right-Aligned Layout */}
          <div className="relative z-20 w-full h-full flex items-start justify-end px-8 xl:px-12 py-8 pt-12">
            <div className="w-full max-w-6xl mr-8 xl:mr-16">
              {/* Top Section - Badge only */}
              <div className="flex items-center gap-6 mb-6">
                <Badge className="bg-[#C1E303] text-black border-2 border-[#C1E303]/50 font-bold text-sm px-4 py-2 shadow-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-[#C1E303]/50 font-display tracking-wider">
                  #gully2glory
                </Badge>
              </div>

              {/* Hero Title - Design System Typography */}
              <div className="space-y-6 text-left">
                <h1 className="font-black leading-tight font-display">
                  <span className="block text-6xl xl:text-7xl 2xl:text-8xl text-white drop-shadow-2xl mb-4 animate-pulse font-extrabold">
                    Southern Street Premier League
                  </span>
                  <span className="block text-2xl xl:text-3xl 2xl:text-4xl text-sport-gold drop-shadow-2xl leading-tight tracking-wider font-bold uppercase">
                    T10 TENNIS BALL CRICKET TOURNAMENT
                  </span>
                </h1>
                <p className="text-body text-black max-w-3xl drop-shadow-lg leading-relaxed font-inter">
                  Join the most exciting T10 Tennis Ball Cricket Tournament. Register yourself and compete with the best players in the league for glory and prizes.
                </p>
              </div>


              {/* Stats Cards - Desktop Layout - Horizontal Line */}
              <div className="relative mt-6">
                <img src="/assets/svg/ball-arc.svg" alt="" className="absolute inset-0 w-full h-full object-contain opacity-20" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="grid grid-cols-4 gap-2" role="region" aria-label="Tournament Statistics">
                {/* Stats Card 1 - Prize Money */}
                <div
                  className="group bg-gradient-to-br from-sport-orange to-sport-orange/80 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg hover:shadow-xl border border-sport-orange/40 transition-all duration-300 hover:scale-105 relative overflow-hidden"
                  role="article"
                  aria-label="Prize Money Information"
                  tabIndex={0}
                >
                  <div className="relative z-10">
                    <div className="bg-sport-orange rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 shadow-lg" aria-hidden="true">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight font-oswald" aria-label="Prize money amount">upto 3 Crores</div>
                    <div className="text-sport-orange text-xs font-semibold bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm" aria-label="Prize money category">
                      {heroContent.stats.prizeMoney.split(':')[0]}
                    </div>
                  </div>
                </div>

                {/* Stats Card 2 - Player Prize */}
                <div className="group bg-gradient-to-br from-blue-400 to-blue-300 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg hover:shadow-xl border border-blue-300/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="bg-blue-400 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight font-oswald">upto 3 Lakhs</div>
                    <div className="text-blue-400 text-xs font-semibold bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm">
                      {heroContent.stats.playerPrize.split(':')[0]}
                    </div>
                  </div>
                </div>

                {/* Stats Card 3 - Finals Venue */}
                <div className="group bg-gradient-to-br from-purple-400 to-purple-300 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg hover:shadow-xl border border-purple-300/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="bg-purple-400 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight font-oswald">Sharjah</div>
                    <div className="text-purple-400 text-xs font-semibold bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm">
                      {heroContent.stats.finalsAt.split(':')[0]}
                    </div>
                  </div>
                </div>

                {/* Stats Card 4 - Teams */}
                <div className="group bg-gradient-to-br from-green-400 to-green-300 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg hover:shadow-xl border border-green-300/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="bg-green-400 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight font-oswald">12</div>
                    <div className="text-green-400 text-xs font-semibold bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm">
                      Teams
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Hero Layout - Full Width Background with Overlay */}
      <div className="block lg:hidden">
        {/* Mobile Hero Section */}
        <div className="relative min-h-[90vh] w-full overflow-hidden">
          {/* Mobile Background Image with Dark Gradient Overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 hero-background-mobile-block" />
            {/* Very light gradient overlay for improved text contrast and brighter background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-black/10" />
          </div>

          {/* Mobile Content - Right-Aligned Layout */}
          <div className="relative z-20 w-full h-full flex items-start justify-end px-6 py-8 pt-10">
            <div className="w-full max-w-4xl mr-4">
              {/* Top Section - Badge only */}
              <div className="flex items-center gap-6 mb-4">
                <Badge className="bg-[#C1E303] text-black border-2 border-[#C1E303]/50 font-bold text-xs px-3 py-1 shadow-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-[#C1E303]/50 font-display tracking-wider">
                  #gully2glory
                </Badge>
              </div>

              {/* Mobile Hero Title - Design System Typography */}
              <div className="space-y-4 text-left">
                <h1 className="font-black leading-tight font-display">
                  <span className="block text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-2xl mb-3 animate-pulse font-extrabold">
                    Southern Street Premier League
                  </span>
                  <span className="block text-lg sm:text-xl md:text-2xl text-sport-gold drop-shadow-2xl leading-tight tracking-wider font-bold uppercase">
                    T10 TENNIS BALL CRICKET TOURNAMENT
                  </span>
                </h1>
                <p className="text-body text-black max-w-xl drop-shadow-lg leading-relaxed font-inter">
                  Join the most exciting T10 Tennis Ball Cricket Tournament. Register yourself and compete with the best players in the league for glory and prizes.
                </p>
              </div>


              {/* Mobile Stats Cards - Enhanced Responsive Grid */}
              <div className="relative pt-8">
                <img src="/assets/svg/ball-arc.svg" alt="" className="absolute inset-0 w-full h-full object-contain opacity-20" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
                {/* Mobile Stats Card 1 - Prize Money */}
                <div className="group bg-gradient-to-br from-sport-orange to-sport-orange/80 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg hover:shadow-xl border border-sport-orange/40 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="bg-sport-orange rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight font-oswald">upto 3 Crores</div>
                    <div className="text-sport-orange text-xs font-semibold bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm">
                      Prize Money
                    </div>
                  </div>
                </div>

                {/* Mobile Stats Card 2 - Player Prize */}
                <div className="group bg-gradient-to-br from-blue-400 to-blue-300 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg hover:shadow-xl border border-blue-300/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="bg-blue-400 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight font-oswald">upto 3 Lakhs</div>
                    <div className="text-blue-400 text-xs font-semibold bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm">
                      Player Prize
                    </div>
                  </div>
                </div>

                {/* Mobile Stats Card 3 - Finals Venue */}
                <div className="group bg-gradient-to-br from-purple-400 to-purple-300 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg hover:shadow-xl border border-purple-300/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="bg-purple-400 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight font-oswald">Sharjah</div>
                    <div className="text-purple-400 text-xs font-semibold bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm">
                      Finals At
                    </div>
                  </div>
                </div>

                {/* Mobile Stats Card 4 - Teams */}
                <div className="group bg-gradient-to-br from-green-400 to-green-300 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg hover:shadow-xl border border-green-300/50 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="bg-green-400 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight font-oswald">12</div>
                    <div className="text-green-400 text-xs font-semibold bg-white/90 rounded-full px-3 py-1 inline-block shadow-sm">
                      Teams
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Dialog open={showRegistrationStepper} onOpenChange={setShowRegistrationStepper}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-describedby="registration-modal-description"
          role="dialog"
          aria-modal="true"
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              <img src="/ssplt10-logo.png" alt="Southern Street Premier League T10 - Tennis Ball Cricket Tournament Logo" className="w-12 h-12 mx-auto mb-2" />
              Player Registration
            </DialogTitle>
            <DialogDescription id="registration-modal-description" className="text-center">
              Register as a player for the SSPL T10 tournament. Fill out the form below to join the league and compete for prizes.
            </DialogDescription>
          </DialogHeader>
          <PlayerRegistrationStepper />
        </DialogContent>
      </Dialog>
    </section>
    </main>
  );
};

export default HeroSection;
