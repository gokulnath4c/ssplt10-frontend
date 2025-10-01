import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Trophy, Calendar, X } from "lucide-react";
import heroImage from "/ravi mohan home with bg.png";
import { useWebsiteContent } from "@/hooks/useWebsiteContent";
import PlayerRegistrationForm from "./PlayerRegistrationForm";
import React, { useState } from "react";
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
    <section id="home" className="relative min-h-[120vh] w-full flex items-start bg-gradient-hero overflow-visible" style={{ marginTop: '0', paddingTop: '0' }}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Hero Image */}
        {/* Fully responsive background image */}
        <div
          className="absolute inset-0 hero-background"
          style={{
            backgroundImage: `url(${heroImage})`
          }}
        />


        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-cricket-electric-blue rounded-full blur-3xl animate-pulse animation-duration-[8000ms]"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-cricket-purple rounded-full blur-3xl animate-pulse animation-delay-[1000ms] animation-duration-[8000ms]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cricket-orange rounded-full blur-2xl animate-pulse animation-delay-[2000ms] animation-duration-[8000ms]"></div>
        </div>
      </div>


      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-20 pt-8 pb-6 lg:pt-12 lg:pb-6">
        <div className="flex items-start justify-start min-h-[85vh] lg:min-h-[90vh]">
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left space-y-2 lg:space-y-2 flex flex-col justify-start">
            <div className="space-y-2">
              <div className="flex flex-col items-start justify-start gap-2 mb-3 w-full">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <Badge className="bg-[#C1E303] text-black border border-black/20 font-bold text-sm px-4 py-2 shadow-2xl backdrop-blur-sm hover:scale-105 transition-transform whitespace-nowrap">
                    #gully2glory
                  </Badge>
                  <Button
                    onClick={() => setIsRegistrationModalOpen(true)}
                    className="bg-[#C1E303] text-black hover:scale-105 animate-pulse-glow flex flex-row items-center justify-center w-auto px-3 h-10 rounded-lg font-semibold cursor-pointer shadow-2xl border border-black/20 hover:bg-[#C1E303]/90 transition-all duration-600"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-xs leading-tight whitespace-nowrap">Registrations Open Now</span>
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-left">
                <span className="text-white block drop-shadow-2xl mb-3">
                  Southern Street Premier League
                </span>
                <span className="text-[#C1E303] drop-shadow-2xl block text-base sm:text-lg lg:text-xl leading-tight tracking-wider font-bold">
                  T10 TENNIS BALL CRICKET TOURNAMENT
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-100 max-w-lg mx-auto lg:mx-0 drop-shadow-lg">
                Join the most exciting T10 Tennis Ball Cricket Tournament. Register yourself and compete with the best players in the league for glory and prizes.
              </p>
            </div>

            {/* Stats Cards - Single Line Colorful Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 w-full max-w-4xl mx-auto">
              {/* Stats Card 1 - Prize Money */}
              <div className="group bg-gradient-to-br from-yellow-400/80 via-orange-500/70 to-red-500/60 backdrop-blur-xl rounded-xl p-4 text-center shadow-2xl hover:shadow-yellow-400/50 border-2 border-yellow-300/50 transition-all duration-1000 hover:scale-110 relative overflow-hidden hover:brightness-110">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-orange-400/30 to-red-400/20 opacity-50 group-hover:opacity-70 transition-opacity duration-600 animate-pulse animation-duration-[8000ms]"></div>
                <div className="absolute inset-0 bg-yellow-300/10 rounded-xl group-hover:bg-yellow-400/20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-2 group-hover:animate-bounce shadow-2xl border-2 border-yellow-200/50 group-hover:shadow-yellow-300/60">
                    <Trophy className="w-7 h-7 text-white drop-shadow-2xl" />
                  </div>
                  <div className="text-xl font-black text-white mb-2 drop-shadow-2xl tracking-wide group-hover:text-yellow-100">upto 3 Crores</div>
                  <div className="text-yellow-100 text-sm font-bold drop-shadow-lg bg-gradient-to-r from-yellow-500/70 to-orange-500/70 rounded-full px-3 py-1 inline-block border border-yellow-300/30 shadow-lg">
                    {heroContent.stats.prizeMoney.split(':')[0]}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Stats Card 2 - Player Prize */}
              <div className="group bg-gradient-to-br from-pink-500/80 via-purple-600/70 to-indigo-600/60 backdrop-blur-xl rounded-xl p-4 text-center shadow-2xl hover:shadow-purple-400/50 border-2 border-pink-300/50 transition-all duration-1000 hover:scale-110 relative overflow-hidden hover:brightness-110 animation-delay-[200ms]">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-500/30 to-indigo-500/20 opacity-50 group-hover:opacity-70 transition-opacity duration-600 animate-pulse animation-delay-[200ms] animation-duration-[8000ms]"></div>
                <div className="absolute inset-0 bg-purple-400/10 rounded-xl group-hover:bg-purple-500/20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-2 group-hover:animate-bounce shadow-2xl border-2 border-pink-200/50 group-hover:shadow-purple-300/60">
                    <Users className="w-7 h-7 text-white drop-shadow-2xl" />
                  </div>
                  <div className="text-xl font-black text-white mb-2 drop-shadow-2xl tracking-wide group-hover:text-pink-100">upto 3 Lakhs</div>
                  <div className="text-purple-100 text-sm font-bold drop-shadow-lg bg-gradient-to-r from-pink-500/70 to-purple-500/70 rounded-full px-3 py-1 inline-block border border-pink-300/30 shadow-lg">
                    {heroContent.stats.playerPrize.split(':')[0]}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Stats Card 3 - Finals Venue */}
              <div className="group bg-gradient-to-br from-blue-500/80 via-cyan-500/70 to-teal-500/60 backdrop-blur-xl rounded-xl p-4 text-center shadow-2xl hover:shadow-cyan-400/50 border-2 border-blue-300/50 transition-all duration-1000 hover:scale-110 relative overflow-hidden hover:brightness-110 animation-delay-[400ms]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-cyan-500/30 to-teal-500/20 opacity-50 group-hover:opacity-70 transition-opacity duration-600 animate-pulse animation-delay-[400ms] animation-duration-[8000ms]"></div>
                <div className="absolute inset-0 bg-cyan-400/10 rounded-xl group-hover:bg-cyan-500/20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-2 group-hover:animate-bounce shadow-2xl border-2 border-blue-200/50 group-hover:shadow-cyan-300/60">
                    <TrendingUp className="w-7 h-7 text-white drop-shadow-2xl" />
                  </div>
                  <div className="text-xl font-black text-white mb-2 drop-shadow-2xl tracking-wide group-hover:text-blue-100">Sharjah</div>
                  <div className="text-cyan-100 text-sm font-bold drop-shadow-lg bg-gradient-to-r from-blue-500/70 to-cyan-500/70 rounded-full px-3 py-1 inline-block border border-blue-300/30 shadow-lg">
                    {heroContent.stats.finalsAt.split(':')[0]}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Stats Card 4 - Teams */}
              <div className="group bg-gradient-to-br from-green-500/80 via-emerald-500/70 to-teal-600/60 backdrop-blur-xl rounded-xl p-4 text-center shadow-2xl hover:shadow-green-400/50 border-2 border-green-300/50 transition-all duration-1000 hover:scale-110 relative overflow-hidden hover:brightness-110 animation-delay-[600ms]">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-500/30 to-teal-500/20 opacity-50 group-hover:opacity-70 transition-opacity duration-600 animate-pulse animation-delay-[600ms] animation-duration-[8000ms]"></div>
                <div className="absolute inset-0 bg-emerald-400/10 rounded-xl group-hover:bg-emerald-500/20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-2 group-hover:animate-bounce shadow-2xl border-2 border-green-200/50 group-hover:shadow-emerald-300/60">
                    <Calendar className="w-7 h-7 text-white drop-shadow-2xl" />
                  </div>
                  <div className="text-xl font-black text-white mb-2 drop-shadow-2xl tracking-wide group-hover:text-green-100">12</div>
                  <div className="text-emerald-100 text-sm font-bold drop-shadow-lg bg-gradient-to-r from-green-500/70 to-emerald-500/70 rounded-full px-3 py-1 inline-block border border-green-300/30 shadow-lg">
                    Teams
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
