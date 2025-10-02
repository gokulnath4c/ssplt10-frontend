import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Calendar, MapPin, Users, Zap, Star, Sparkles } from 'lucide-react';
import './ChennaiTrialsAnimatedBanner.css';

// Types
interface ChennaiTrialsAnnouncement {
  title: string;
  venue: string;
  date: string;
  body: string;
  callout: string;
  ctaText: string;
  pricing?: {
    baseAmount: number;
    gstPercentage: number;
    totalAmount: number;
  };
}

interface ChennaiTrialsAnimatedBannerProps {
  announcement: ChennaiTrialsAnnouncement;
  onRegister: () => void;
  onClose?: () => void;
  isVisible?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

// Enhanced Particle System Component
const AdvancedParticleSystem: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    life: number;
    maxLife: number;
  }>>([]);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize enhanced particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(canvas.width * canvas.height / 8000, 80);

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          color: `hsl(${Math.random() * 60 + 200}, 80%, ${Math.random() * 40 + 50}%)`,
          life: Math.random() * 100 + 50,
          maxLife: Math.random() * 100 + 50
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        // Fade out particles as they age
        particle.opacity = (particle.life / particle.maxLife) * 0.8;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Respawn particles that have died
        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = particle.maxLife;
          particle.color = `hsl(${Math.random() * 60 + 200}, 80%, ${Math.random() * 40 + 50}%)`;
        }

        // Draw particle with enhanced glow effect
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw connections between nearby particles
        particlesRef.current.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.save();
            ctx.globalAlpha = (120 - distance) / 120 * 0.15 * particle.opacity * otherParticle.opacity;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none chennai-trials-canvas"
    />
  );
};

// Floating Geometric Elements
const FloatingGeometricElements: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const elements = [
    { shape: 'polygon', points: '25,5 45,5 40,25 10,25', delayClass: 'floating-geometric-delay-0', color: 'rgba(59, 130, 246, 0.2)' },
    { shape: 'circle', cx: '50', cy: '50', r: '15', delayClass: 'floating-geometric-delay-1', color: 'rgba(16, 185, 129, 0.2)' },
    { shape: 'polygon', points: '30,10 50,10 45,30 25,30', delayClass: 'floating-geometric-delay-2', color: 'rgba(245, 158, 11, 0.2)' },
    { shape: 'polygon', points: '20,15 40,15 35,35 15,35', delayClass: 'floating-geometric-delay-3', color: 'rgba(239, 68, 68, 0.2)' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute animate-float-geometric floating-geometric-element ${element.delayClass}`}
        >
          <svg width="60" height="60" className="animate-spin-slow">
            {element.shape === 'polygon' ? (
              <polygon
                points={element.points}
                fill={element.color}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                className="animate-pulse"
              />
            ) : (
              <circle
                cx={element.cx}
                cy={element.cy}
                r={element.r}
                fill={element.color}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                className="animate-pulse"
              />
            )}
          </svg>
        </div>
      ))}
    </div>
  );
};

// Energy Field Component
const EnergyField: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Energy waves */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-blue-400/30 rounded-full animate-energy-wave" />
      <div className="absolute top-3/4 right-1/4 w-24 h-24 border-2 border-green-400/30 rounded-full animate-energy-wave-delayed" />
      <div className="absolute top-1/2 left-3/4 w-20 h-20 border-2 border-purple-400/30 rounded-full animate-energy-wave-slow" />

      {/* Energy particles */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-energy-particle shadow-lg shadow-blue-400/50" />
      <div className="absolute top-20 right-20 w-3 h-3 bg-green-400 rounded-full animate-energy-particle-delayed shadow-lg shadow-green-400/50" />
      <div className="absolute bottom-10 left-20 w-2 h-2 bg-purple-400 rounded-full animate-energy-particle-slow shadow-lg shadow-purple-400/50" />
    </div>
  );
};

// Lightning Effect Component
const LightningEffect: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-yellow-300 to-transparent animate-lightning-bolt" />
      <div className="absolute top-0 right-1/4 w-0.5 h-12 bg-gradient-to-b from-blue-300 to-transparent animate-lightning-bolt-delayed" />
      <div className="absolute top-0 left-1/4 w-0.5 h-12 bg-gradient-to-b from-purple-300 to-transparent animate-lightning-bolt-slow" />
    </div>
  );
};

const ChennaiTrialsAnimatedBanner: React.FC<ChennaiTrialsAnimatedBannerProps> = ({
  announcement,
  onRegister,
  onClose,
  isVisible: controlledIsVisible,
  showCloseButton = true,
  className = ""
}) => {
  const [internalIsVisible, setInternalIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Use controlled visibility if provided, otherwise use internal state
  const isVisible = controlledIsVisible !== undefined ? controlledIsVisible : internalIsVisible;

  // Handle close button click
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsVisible(false);
    }
  };

  // Handle mouse movement for parallax effects
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 3 - 1.5;
    const y = ((e.clientY - rect.top) / rect.height) * 3 - 1.5;
    setMousePosition({ x, y });

    // Set CSS custom properties for parallax effect
    bannerRef.current.style.setProperty('--mouse-x', `${x}`);
    bannerRef.current.style.setProperty('--mouse-y', `${y}`);
  };

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Initialize CSS custom properties for parallax effect
    if (bannerRef.current) {
      bannerRef.current.style.setProperty('--mouse-x', '0');
      bannerRef.current.style.setProperty('--mouse-y', '0');
    }

    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setInternalIsVisible(true);
    }, 100);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearTimeout(timer);
    };
  }, []);

  const animationClass = prefersReducedMotion ? 'opacity-100' : 'animate-spectacular-entrance';
  const textAnimationClass = prefersReducedMotion ? 'opacity-100' : 'animate-text-reveal';
  const ctaAnimationClass = prefersReducedMotion ? 'opacity-100 scale-100' : 'animate-cta-ascension';

  // Calculate pricing display
  const pricingDisplay = useMemo(() => {
    if (!announcement.pricing) return null;

    const { baseAmount, gstPercentage, totalAmount } = announcement.pricing;
    return {
      baseAmount,
      gstPercentage,
      gstAmount: Math.round(baseAmount * gstPercentage / 100),
      totalAmount
    };
  }, [announcement.pricing]);

  return (
    <>
      {/* Main animated component */}
      <section
        className={`w-full ${className} ${isVisible ? animationClass : 'opacity-0'}`}
        aria-label="Chennai Trials Announcement"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={bannerRef}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-2 border-indigo-200 shadow-2xl backdrop-blur-sm group hover:scale-[1.02] transition-all duration-700 chennai-trials-banner ${
              isHovered ? 'shadow-indigo-500/50' : 'shadow-indigo-200/50'
            }`}
            role="banner"
            aria-labelledby="chennai-trials-title"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              // Reset parallax effect when mouse leaves
              if (bannerRef.current) {
                bannerRef.current.style.setProperty('--mouse-x', '0');
                bannerRef.current.style.setProperty('--mouse-y', '0');
              }
            }}
          >
            {/* Enhanced Background decoration with multi-layered gradients */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full blur-2xl animate-color-shift" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400 rounded-full blur-2xl animate-color-shift-delayed" />
              <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-full blur-2xl animate-color-shift-slow" />
              <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 rounded-full blur-2xl animate-color-shift-fast" />
            </div>

            {/* Advanced Particle System */}
            <AdvancedParticleSystem isVisible={isVisible} />

            {/* Floating Geometric Elements */}
            <FloatingGeometricElements isVisible={isVisible} />

            {/* Energy Field */}
            <EnergyField isVisible={isVisible} />

            {/* Lightning Effect */}
            <LightningEffect isVisible={isVisible} />

            {/* Enhanced Close Button with spectacular effects */}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 p-4 rounded-full bg-white/90 hover:bg-white shadow-2xl hover:shadow-indigo-500/50 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 group/close hover:scale-125 animate-float-gentle backdrop-blur-sm"
                aria-label="Close banner"
              >
                <svg
                  className="w-6 h-6 text-gray-600 hover:text-indigo-800 transition-all duration-300 group-hover/close:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Dynamic gradient overlay with enhanced color-shifting */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-cyan-600/15 backdrop-blur-sm animate-gradient-shift"></div>

            {/* Enhanced Animated background elements with multi-layered glow effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="banner-glow-element banner-glow-delay-0" />
              <div className="banner-glow-element banner-glow-delay-1" />
              <div className="banner-glow-element banner-glow-delay-2" />
              <div className="banner-glow-element banner-glow-delay-3" />
            </div>

            {/* Spectacular floating icons */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 animate-float-spectacular z-0 opacity-20">
              <div className="relative w-full h-full">
                <Star className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 text-yellow-400 animate-spin-slow" />
                <Zap className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-8 text-blue-400 animate-bounce-slow" />
                <Sparkles className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 text-purple-400 animate-pulse" />
              </div>
            </div>

            <div className="relative p-8 sm:p-10 lg:p-12 text-center space-y-8 z-10">
              {/* Enhanced Content with staggered animations */}
              <div className="space-y-6">
                <div className={`transition-all duration-700 ${isVisible ? textAnimationClass : 'opacity-0'}`}>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-100 via-purple-100 to-cyan-100 text-indigo-800 text-sm font-bold mb-6 shadow-2xl animate-badge-glow backdrop-blur-sm">
                    <Users className="w-5 h-5 animate-pulse" />
                    {announcement.callout}
                    <Sparkles className="w-5 h-5 animate-spin" />
                  </div>
                </div>

                <h2
                  id="chennai-trials-title"
                  className={`text-4xl sm:text-5xl lg:text-7xl font-black leading-tight transition-all duration-700 delay-100 chennai-trials-title ${isVisible ? `chennai-trials-title-animate ${textAnimationClass}` : 'opacity-0'}`}
                >
                  {announcement.title}
                </h2>

                <div
                  className={`space-y-4 text-gray-700 transition-all duration-700 delay-200 ${isVisible ? textAnimationClass : 'opacity-0'}`}
                >
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold text-indigo-700 animate-slide-in-from-left">
                    <MapPin className="w-7 h-7 animate-pulse" />
                    {announcement.venue}
                  </div>
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold text-cyan-700 animate-slide-in-from-right">
                    <Calendar className="w-7 h-7 animate-pulse" />
                    {announcement.date}
                  </div>
                </div>

                <p
                  className={`text-2xl text-gray-800 leading-relaxed max-w-4xl mx-auto transition-all duration-700 delay-300 ${isVisible ? textAnimationClass : 'opacity-0'}`}
                >
                  {announcement.body}
                </p>

                {/* Pricing Section */}
                {pricingDisplay && (
                  <div className={`transition-all duration-700 delay-400 ${isVisible ? textAnimationClass : 'opacity-0'}`}>
                    <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 shadow-2xl backdrop-blur-sm">
                      <div className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                        Registration Fee
                      </div>
                      <div className="text-4xl font-black text-emerald-800">
                        ₹{pricingDisplay.totalAmount}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Base: ₹{pricingDisplay.baseAmount} + GST {pricingDisplay.gstPercentage}% (₹{pricingDisplay.gstAmount})</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spectacular CTA Button */}
                <div
                  className={`flex justify-center transition-all duration-700 delay-500 ${isVisible ? ctaAnimationClass : 'opacity-0 scale-75'}`}
                >
                  <button
                    onClick={onRegister}
                    className="group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-black py-6 px-12 rounded-full shadow-2xl hover:shadow-indigo-500/60 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 min-w-[250px] text-center hover:scale-110 active:scale-95 animate-glow-pulse overflow-hidden text-xl"
                    aria-label={`Register for ${announcement.title} at ${announcement.venue}`}
                  >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-3 left-3 w-3 h-3 bg-white/40 rounded-full animate-ping cta-particle-delay-0" />
                      <div className="absolute top-5 right-4 w-2 h-2 bg-white/50 rounded-full animate-ping cta-particle-delay-1" />
                      <div className="absolute bottom-4 left-5 w-2.5 h-2.5 bg-white/30 rounded-full animate-ping cta-particle-delay-2" />
                      <div className="absolute bottom-3 right-3 w-2 h-2 bg-white/60 rounded-full animate-ping cta-particle-delay-3" />
                    </div>

                    {/* Button content */}
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      <span className="hidden sm:inline">{announcement.ctaText}</span>
                      <span className="sm:hidden">Register</span>
                      <Zap className="w-6 h-6 animate-bounce" />
                    </span>

                    {/* Enhanced hover effect overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-gradient-flow" />

                    {/* Ripple effect */}
                    <div className="absolute inset-0 rounded-full bg-white/30 opacity-0 group-active:opacity-100 animate-ping" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NoScript fallback */}
      <noscript>
        <section className={`w-full ${className}`} role="banner" aria-labelledby="chennai-trials-title-fallback">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-2 border-indigo-200 shadow-2xl rounded-3xl p-8 sm:p-10 lg:p-12">
              {showCloseButton && onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-300"
                  aria-label="Close banner"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold">
                  <Users className="w-4 h-4" />
                  {announcement.callout}
                </div>

                <h2 id="chennai-trials-title-fallback" className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900">
                  {announcement.title}
                </h2>

                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center justify-center gap-2 text-xl font-bold text-indigo-700">
                    <MapPin className="w-5 h-5" />
                    {announcement.venue}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xl font-bold text-cyan-700">
                    <Calendar className="w-5 h-5" />
                    {announcement.date}
                  </div>
                </div>

                <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  {announcement.body}
                </p>

                {pricingDisplay && (
                  <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                      Registration Fee
                    </div>
                    <div className="text-3xl font-black text-emerald-800">
                      ₹{pricingDisplay.totalAmount}
                    </div>
                    <div className="text-sm text-gray-600">
                      ₹{pricingDisplay.baseAmount} + GST {pricingDisplay.gstPercentage}%
                    </div>
                  </div>
                )}

                <button
                  onClick={onRegister}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50"
                  aria-label={`Register for ${announcement.title} at ${announcement.venue}`}
                >
                  {announcement.ctaText}
                </button>
              </div>
            </div>
          </div>
        </section>
      </noscript>
    </>
  );
};

export default ChennaiTrialsAnimatedBanner;

// Export types for reuse
export type { ChennaiTrialsAnnouncement, ChennaiTrialsAnimatedBannerProps };