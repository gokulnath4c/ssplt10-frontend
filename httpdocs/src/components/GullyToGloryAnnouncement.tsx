import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Sparkles, Trophy, Zap, Star, Heart, X } from "lucide-react";

const GullyToGloryAnnouncement = () => {
  const [animateElements, setAnimateElements] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Start celebration animations
    const timer = setTimeout(() => {
      setAnimateElements(true);
      setShowConfetti(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handlePhoneCall = () => {
    window.open('tel:+918807775690', '_self');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/918807775690?text=Hi%2C%20I%20am%20interested%20in%20Gully%20to%20Glory%20registration', '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Animated Confetti Background */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`absolute animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              {i % 5 === 0 && <Sparkles className="w-3 h-3 text-yellow-400 opacity-60" />}
              {i % 5 === 1 && <Star className="w-3 h-3 text-blue-400 opacity-60" />}
              {i % 5 === 2 && <Heart className="w-3 h-3 text-red-400 opacity-60" />}
              {i % 5 === 3 && <Zap className="w-3 h-3 text-orange-400 opacity-60" />}
              {i % 5 === 4 && <Trophy className="w-3 h-3 text-green-400 opacity-60" />}
            </div>
          ))}
        </div>
      )}

      <div className={`bg-slate-50 rounded-lg border border-slate-200 p-3 relative transition-all duration-1000 ${animateElements ? 'animate-fade-in shadow-lg' : ''}`}>

        {/* Animated Header */}
        <div className={`flex items-center justify-center gap-2 mb-2 transition-all duration-1000 ${animateElements ? 'animate-bounce' : ''}`}>
          <Trophy className="w-4 h-4 text-yellow-500 animate-pulse" />
          <span className="text-slate-700 font-black text-sm uppercase tracking-wider animate-pulse">
            #gully2glory
          </span>
          <Trophy className="w-4 h-4 text-yellow-500 animate-pulse" />
        </div>

        {/* Pulsing Title Section */}
        <div className={`mb-2 text-center transition-all duration-1000 ${animateElements ? 'animate-pulse' : ''}`}>
          <h3 className="text-base font-black text-slate-800 mb-1 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            🔥 REGISTRATIONS OPEN TILL NOV 15! 🔥
          </h3>
          <p className="text-sm text-blue-600 font-bold uppercase tracking-wide animate-pulse">
            FOR ALL STATES
          </p>
        </div>

        {/* Animated Message Section */}
        <div className={`mb-3 text-sm space-y-1.5 transition-all duration-1000 ${animateElements ? 'animate-fade-in' : ''}`}>
          <p className="font-bold text-slate-700 text-center">
            Dear Players,
          </p>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded p-2 border border-red-200">
            <p className="text-slate-600 text-center">
              Round 1 - Batch 1: Tamil Nadu <span className="text-red-500 font-black animate-pulse">over</span>
            </p>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded p-2 border border-emerald-200">
            <p className="text-slate-600 text-center">
              Andhra Pradesh <span className="text-emerald-600 font-black animate-bounce">your turn now!</span>
            </p>
          </div>
        </div>

        {/* Interactive Contact Section */}
        <div className={`space-y-2 transition-all duration-1000 ${animateElements ? 'animate-fade-in' : ''}`}>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <MessageCircle className={`w-4 h-4 transition-all duration-500 ${animateElements ? 'animate-spin' : ''}`} />
            <span className="text-sm font-semibold">DM / Call 8807775690</span>
          </div>

          {/* Animated Contact Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handlePhoneCall}
              size="sm"
              className={`flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-md ${animateElements ? 'animate-pulse' : ''}`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
            <Button
              onClick={handleWhatsApp}
              size="sm"
              className={`flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-md ${animateElements ? 'animate-pulse' : ''}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Floating Celebration Elements */}
        {animateElements && (
          <>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
            </div>
            <div className="absolute -top-1 -left-1">
              <Star className="w-4 h-4 text-blue-400 animate-bounce" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GullyToGloryAnnouncement;