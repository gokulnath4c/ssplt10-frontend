import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Trophy, Calendar, X, Star, Sparkles } from "lucide-react";
import heroImage from "/ravi mohan home with bg.png";
import { useWebsiteContent } from "@/hooks/useWebsiteContent";
import PlayerRegistrationForm from "./PlayerRegistrationForm";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HeroSection = () => {
  const { getContent, loading } = useWebsiteContent();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isTrialsCardVisible, setIsTrialsCardVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
    <section id="home" className="relative min-h-[120vh] w-full flex items-start overflow-hidden" style={{ marginTop: '0', paddingTop: '0' }}>
      {/* Premium Background Layers */}
      <div className="absolute inset-0">
        {/* Hero Image with Enhanced Overlay */}
        <div
          className="absolute inset-0 hero-background"
          style={{
            backgroundImage: `url(${heroImage})`
          }}
        />

        {/* Premium Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-cricket-blue/80 via-cricket-dark-blue/60 to-cricket-electric-blue/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

        {/* Floating Geometric Elements */}
        <div className="absolute inset-0 opacity-20 will-change-transform">
          {/* Animated Orbs */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-cricket-electric-blue rounded-full blur-3xl animate-pulse animation-duration-[8000ms] hover:scale-110 transition-transform duration-1000 will-change-transform" style={{ willChange: 'transform' }}></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-cricket-purple rounded-full blur-3xl animate-pulse animation-delay-[1000ms] animation-duration-[8000ms] hover:scale-110 transition-transform duration-1000 will-change-transform" style={{ willChange: 'transform' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cricket-orange rounded-full blur-2xl animate-pulse animation-delay-[2000ms] animation-duration-[8000ms] hover:scale-110 transition-transform duration-1000 will-change-transform" style={{ willChange: 'transform' }}></div>

          {/* Floating Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cricket-gold rounded-full animate-bounce animation-duration-[6000ms] opacity-60 will-change-transform" style={{ willChange: 'transform' }}></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-cricket-mint rounded-full animate-bounce animation-delay-[2000ms] animation-duration-[4000ms] opacity-80 will-change-transform" style={{ willChange: 'transform' }}></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-cricket-teal rounded-full animate-bounce animation-delay-[4000ms] animation-duration-[5000ms] opacity-70 will-change-transform" style={{ willChange: 'transform' }}></div>
        </div>

        {/* Premium Glassmorphism Layer */}
        <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
      </div>


      {/* Premium Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-20 pt-8 pb-6 sm:pt-12 sm:pb-8 lg:pt-16 lg:pb-12 will-change-transform">
        <div className="flex items-center justify-center min-h-[85vh] lg:min-h-[90vh]">
          {/* Hero Content with Premium Layout */}
          <div className={`text-center space-y-4 sm:space-y-6 lg:space-y-8 flex flex-col justify-center items-center max-w-6xl mx-auto transition-all duration-1000 will-change-transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="space-y-6">
              {/* Premium Badge and CTA Section */}
              <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6 w-full">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
                  <Badge className="bg-gradient-to-r from-cricket-gold via-cricket-orange to-cricket-gold text-black border-0 font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 shadow-elegant backdrop-blur-sm hover:scale-105 transition-all duration-300 whitespace-nowrap relative overflow-hidden group w-full sm:w-auto justify-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 inline-block" />
                    #gully2glory
                  </Badge>
                  <Button
                    onClick={() => setIsRegistrationModalOpen(true)}
                    className="group relative bg-gradient-to-r from-cricket-electric-blue to-cricket-blue text-white hover:scale-105 flex flex-row items-center justify-center w-full sm:w-auto px-4 sm:px-6 h-10 sm:h-12 rounded-xl font-semibold cursor-pointer shadow-glow border-0 hover:shadow-elegant transition-all duration-500 overflow-hidden text-sm sm:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cricket-gold/20 via-transparent to-cricket-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="leading-tight whitespace-nowrap font-bold">Registrations Open Now</span>
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:scale-110 transition-transform duration-300" />
                  </Button>
                </div>
              </div>

              {/* Premium Typography Section */}
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-center">
                  <span className="block text-white drop-shadow-2xl mb-2 sm:mb-4 bg-gradient-to-r from-white via-cricket-white to-white bg-clip-text text-transparent animate-fade-in">
                    Southern Street Premier League
                  </span>
                  <span className="block text-cricket-gold drop-shadow-2xl text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl leading-tight tracking-wider font-bold bg-gradient-to-r from-cricket-gold via-cricket-orange to-cricket-gold bg-clip-text text-transparent animate-fade-in animation-delay-[200ms]">
                    T10 TENNIS BALL CRICKET TOURNAMENT
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 max-w-3xl mx-auto drop-shadow-lg leading-relaxed font-medium bg-gradient-to-r from-gray-100 to-gray-200 bg-clip-text text-transparent px-4">
                  Join the most exciting T10 Tennis Ball Cricket Tournament. Register yourself and compete with the best players in the league for glory and prizes.
                </p>
              </div>
            </div>

            {/* Premium Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8 w-full max-w-5xl mx-auto px-2 sm:px-0">
              {/* Stats Card 1 - Prize Money */}
              <div className="group glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-elegant hover:shadow-float border border-white/10 transition-all duration-500 hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cricket-gold/20 via-cricket-orange/30 to-cricket-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-cricket-gold to-cricket-orange rounded-xl sm:rounded-2xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:animate-bounce shadow-glow border-2 border-cricket-gold/30 group-hover:shadow-elegant transition-all duration-300">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-2 sm:mb-3 drop-shadow-2xl tracking-wide group-hover:text-cricket-gold transition-colors duration-300">upto 3 Crores</div>
                  <div className="text-cricket-gold text-xs sm:text-sm font-bold drop-shadow-lg bg-gradient-to-r from-cricket-gold/80 to-cricket-orange/80 rounded-full px-2 sm:px-4 py-1 sm:py-2 inline-block border border-cricket-gold/30 shadow-elegant backdrop-blur-sm">
                    {heroContent.stats.prizeMoney.split(':')[0]}
                  </div>
                </div>
              </div>

              {/* Stats Card 2 - Player Prize */}
              <div className="group glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-elegant hover:shadow-float border border-white/10 transition-all duration-500 hover:scale-105 relative overflow-hidden animation-delay-[200ms]">
                <div className="absolute inset-0 bg-gradient-to-br from-cricket-purple/20 via-cricket-electric-blue/30 to-cricket-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-cricket-purple to-cricket-electric-blue rounded-xl sm:rounded-2xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:animate-bounce shadow-glow border-2 border-cricket-purple/30 group-hover:shadow-elegant transition-all duration-300">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-2 sm:mb-3 drop-shadow-2xl tracking-wide group-hover:text-cricket-purple transition-colors duration-300">upto 3 Lakhs</div>
                  <div className="text-cricket-purple text-xs sm:text-sm font-bold drop-shadow-lg bg-gradient-to-r from-cricket-purple/80 to-cricket-electric-blue/80 rounded-full px-2 sm:px-4 py-1 sm:py-2 inline-block border border-cricket-purple/30 shadow-elegant backdrop-blur-sm">
                    {heroContent.stats.playerPrize.split(':')[0]}
                  </div>
                </div>
              </div>

              {/* Stats Card 3 - Finals Venue */}
              <div className="group glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-elegant hover:shadow-float border border-white/10 transition-all duration-500 hover:scale-105 relative overflow-hidden animation-delay-[400ms]">
                <div className="absolute inset-0 bg-gradient-to-br from-cricket-teal/20 via-cricket-electric-blue/30 to-cricket-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-cricket-teal to-cricket-electric-blue rounded-xl sm:rounded-2xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:animate-bounce shadow-glow border-2 border-cricket-teal/30 group-hover:shadow-elegant transition-all duration-300">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-2 sm:mb-3 drop-shadow-2xl tracking-wide group-hover:text-cricket-teal transition-colors duration-300">Sharjah</div>
                  <div className="text-cricket-teal text-xs sm:text-sm font-bold drop-shadow-lg bg-gradient-to-r from-cricket-teal/80 to-cricket-electric-blue/80 rounded-full px-2 sm:px-4 py-1 sm:py-2 inline-block border border-cricket-teal/30 shadow-elegant backdrop-blur-sm">
                    {heroContent.stats.finalsAt.split(':')[0]}
                  </div>
                </div>
              </div>

              {/* Stats Card 4 - Teams */}
              <div className="group glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-elegant hover:shadow-float border border-white/10 transition-all duration-500 hover:scale-105 relative overflow-hidden animation-delay-[600ms]">
                <div className="absolute inset-0 bg-gradient-to-br from-cricket-green/20 via-cricket-teal/30 to-cricket-mint/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-cricket-green to-cricket-teal rounded-xl sm:rounded-2xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:animate-bounce shadow-glow border-2 border-cricket-green/30 group-hover:shadow-elegant transition-all duration-300">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-2 sm:mb-3 drop-shadow-2xl tracking-wide group-hover:text-cricket-green transition-colors duration-300">12</div>
                  <div className="text-cricket-green text-xs sm:text-sm font-bold drop-shadow-lg bg-gradient-to-r from-cricket-green/80 to-cricket-teal/80 rounded-full px-2 sm:px-4 py-1 sm:py-2 inline-block border border-cricket-green/30 shadow-elegant backdrop-blur-sm">
                    Teams
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chennai Trials Announcement Card */}
      {isTrialsCardVisible && (
        <div className="absolute top-12 right-4 z-30 lg:block">
          <div className="relative group cursor-pointer transition-all duration-300 ease-in-out hover:scale-105">
          {/* Enhanced Glow Effect Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl blur-xl opacity-30 animate-pulse group-hover:opacity-60 group-hover:blur-2xl transition-all duration-1000 animation-duration-[8000ms]"></div>

          {/* Cricket Ball Orbit Animation */}
          <div className="absolute -top-4 -left-4 w-6 h-6 text-yellow-400 animate-bounce animation-delay-[0ms] animation-duration-[8000ms]">
            🏏
          </div>
          <div className="absolute -top-2 -right-6 w-5 h-5 text-pink-400 animate-bounce animation-delay-[500ms] animation-duration-[10000ms]">
            🏏
          </div>
          <div className="absolute -bottom-4 -left-2 w-4 h-4 text-blue-400 animate-bounce animation-delay-[1000ms] animation-duration-[12000ms]">
            🏏
          </div>
          <div className="absolute -bottom-2 -right-4 w-5 h-5 text-purple-400 animate-bounce animation-delay-[1500ms] animation-duration-[8800ms]">
            🏏
          </div>

          {/* Wicket Elements */}
          <div className="absolute top-1 left-1 text-white/60 text-xs animate-pulse animation-delay-[300ms]">
            🏘️
          </div>
          <div className="absolute bottom-1 right-1 text-white/60 text-xs animate-pulse animation-delay-[1200ms]">
            🏘️
          </div>

          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-pink-500/90 via-purple-600/90 to-blue-600/90 backdrop-blur-xl rounded-2xl p-3 sm:p-5 w-64 sm:w-72 h-80 sm:h-96 shadow-2xl border border-white/20 overflow-hidden group-hover:shadow-3xl transition-all duration-600">
            {/* Enhanced Animated Confetti Background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-3 left-6 w-3 h-3 bg-yellow-300 rounded-full animate-bounce group-hover:animate-ping animation-delay-[0ms]"></div>
              <div className="absolute top-8 right-8 w-2 h-2 bg-pink-300 rounded-full animate-bounce group-hover:animate-ping animation-delay-[500ms]"></div>
              <div className="absolute bottom-6 left-10 w-3 h-3 bg-blue-300 rounded-full animate-bounce group-hover:animate-ping animation-delay-[1000ms]"></div>
              <div className="absolute bottom-8 right-6 w-2 h-2 bg-purple-300 rounded-full animate-bounce group-hover:animate-ping animation-delay-[1500ms]"></div>
              <div className="absolute top-1/2 left-4 w-2 h-2 bg-green-300 rounded-full animate-bounce group-hover:animate-ping animation-delay-[2000ms]"></div>
              <div className="absolute top-1/2 right-4 w-2 h-2 bg-orange-300 rounded-full animate-bounce group-hover:animate-ping animation-delay-[2500ms]"></div>
            </div>

            {/* Cricket Bat Elements */}
            <div className="absolute top-4 left-4 text-white/40 text-sm animate-pulse group-hover:animate-bounce animation-delay-[800ms]">
              🏏
            </div>
            <div className="absolute bottom-4 right-4 text-white/40 text-sm animate-pulse group-hover:animate-bounce animation-delay-[1800ms]">
              🏏
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsTrialsCardVisible(false)}
              className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all duration-200 hover:scale-110"
              aria-label="Close card"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-sm sm:text-lg font-black text-white drop-shadow-2xl tracking-wider mb-2 group-hover:text-yellow-200 transition-colors duration-300 animate-pulse hero-text-shadow">
                🎉 CHENNAI TRIALS 🎉
              </div>
              <div className="mb-4 flex justify-center relative">
                <div className="absolute -top-2 -left-2 text-yellow-300 animate-spin animation-duration-[6000ms]">✨</div>
                <div className="absolute -top-2 -right-2 text-pink-300 animate-ping animation-duration-[4000ms]">⭐</div>
                <div className="absolute -bottom-2 -left-2 text-blue-300 animate-spin animation-duration-[8000ms]">💫</div>
                <div className="absolute -bottom-2 -right-2 text-purple-300 animate-ping animation-duration-[5000ms]">🌟</div>
                <img
                  src="/image_3.png"
                  alt="Chennai Trials Image"
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full animate-spin shadow-lg animation-duration-[120000ms]"
                />
              </div>
              <div className="text-xs sm:text-sm font-bold text-yellow-200 drop-shadow-lg leading-tight break-words group-hover:text-yellow-100 transition-colors duration-300">
                🏏 Chennai Trials are here! The most awaited first trials kick off on 20 - 21st September 2025 at Pachaiyappa's College, Chennai. Don't miss your chance—register now and be part of this thrilling tournament journey!
                <br />
                <span className="text-sm sm:text-lg font-black text-yellow-300 animate-pulse hero-text-shadow-yellow">Spot Registrations Available!</span>
              </div>

              {/* Enhanced Sparkle Effects */}
              <div className="absolute top-2 right-2 text-yellow-300 animate-spin group-hover:animate-ping animation-duration-[4000ms]">
                ✨
              </div>
              <div className="absolute bottom-2 left-2 text-pink-300 animate-spin group-hover:animate-ping animation-duration-[5000ms]">
                ⭐
              </div>
              <div className="absolute top-1/2 left-2 text-blue-300 animate-spin group-hover:animate-ping animation-duration-[6000ms]">
                💫
              </div>
              <div className="absolute top-1/2 right-2 text-purple-300 animate-spin group-hover:animate-ping animation-duration-[7000ms]">
                🌟
              </div>
              <div className="absolute top-4 left-4 text-green-300 animate-spin group-hover:animate-ping animation-duration-[8000ms]">
                ✨
              </div>
              <div className="absolute bottom-4 right-4 text-orange-300 animate-spin group-hover:animate-ping animation-duration-[9000ms]">
                ⭐
              </div>
              <div className="absolute top-1/3 right-6 text-cyan-300 animate-spin group-hover:animate-ping animation-duration-[10000ms]">
                💫
              </div>
              <div className="absolute bottom-1/3 left-6 text-red-300 animate-spin group-hover:animate-ping animation-duration-[11000ms]">
                🌟
              </div>
            </div>

            {/* Enhanced Gradient Border Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-50 animate-pulse group-hover:opacity-70 transition-opacity duration-600 animation-duration-[8000ms]"></div>

            {/* Celebration Burst Effect on Hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl animate-ping">
                🎊
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Registration Modal */}
      <Dialog open={isRegistrationModalOpen} onOpenChange={setIsRegistrationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-cricket-blue">
              Player Registration
            </DialogTitle>
          </DialogHeader>
          <PlayerRegistrationForm />
        </DialogContent>
      </Dialog>

    </section>
  );
};

export default HeroSection;
