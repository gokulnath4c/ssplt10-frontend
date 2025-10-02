import React, { useEffect, useState, useRef } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

// Types
interface CricketTrialsAnnouncement {
  title: string;
  venue: string;
  date: string;
  body: string;
  callout: string;
  ctaText: string;
}

interface CricketTrialsBannerProps {
  announcement: CricketTrialsAnnouncement;
  onRegister: () => void;
  onClose?: () => void;
  isVisible?: boolean;
  showCloseButton?: boolean;
  apiEndpoint?: string;
  className?: string;
}

// Particle System Component
const ParticleSystem: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
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

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(canvas.width * canvas.height / 15000, 50);

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.6 + 0.2,
          color: `hsl(${Math.random() * 60 + 200}, 70%, ${Math.random() * 30 + 50}%)`
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with glow effect
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.shadowBlur = 10;
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

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = (100 - distance) / 100 * 0.1;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
};

// Floating Cricket Elements
const FloatingCricketElements: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const elements = [
    { icon: '🏏', delay: '0s', duration: '6s' },
    { icon: '⚾', delay: '1s', duration: '8s' },
    { icon: '🏆', delay: '2s', duration: '7s' },
    { icon: '🎯', delay: '3s', duration: '9s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute text-4xl opacity-20 animate-float-up`}
          style={{
            left: `${20 + index * 20}%`,
            animationDelay: element.delay,
            animationDuration: element.duration,
            filter: 'drop-shadow(0 0 10px currentColor)',
          }}
        >
          {element.icon}
        </div>
      ))}
    </div>
  );
};

// Morphing Background Shapes
const MorphingShapes: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full animate-morph-shape" />
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-green-400/30 to-teal-400/30 rounded-full animate-morph-shape-delayed" />
      <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-full animate-morph-shape-slow" />
    </div>
  );
};

// SVG Components with Enhanced Animations
const CricketBallIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    aria-hidden="true"
    role="img"
  >
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="#dc2626"
      stroke="#991b1b"
      strokeWidth="2"
      className="animate-pulse-glow"
    />
    <path
      d="M50 5 L50 95 M5 50 L95 50"
      stroke="#991b1b"
      strokeWidth="3"
      opacity="0.8"
      className="animate-rotate-seam"
    />
    <path
      d="M25 25 L75 75 M75 25 L25 75"
      stroke="#991b1b"
      strokeWidth="2"
      opacity="0.6"
      className="animate-rotate-seam-reverse"
    />
    <circle cx="50" cy="50" r="8" fill="#991b1b" opacity="0.9" className="animate-pulse" />
  </svg>
);

const CricketBatIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 200"
    className={className}
    aria-hidden="true"
    role="img"
  >
    <ellipse
      cx="50"
      cy="180"
      rx="25"
      ry="15"
      fill="#8b4513"
      stroke="#654321"
      strokeWidth="2"
      className="animate-glow"
    />
    <rect
      x="35"
      y="20"
      width="30"
      height="160"
      rx="15"
      fill="#a0522d"
      stroke="#8b4513"
      strokeWidth="2"
      className="animate-shimmer"
    />
    <rect
      x="40"
      y="30"
      width="20"
      height="140"
      rx="10"
      fill="#cd853f"
      opacity="0.8"
      className="animate-grain-texture"
    />
    <path
      d="M30 40 Q50 35 70 40"
      stroke="#8b4513"
      strokeWidth="2"
      fill="none"
      className="animate-wood-grain"
    />
    <path
      d="M30 60 Q50 55 70 60"
      stroke="#8b4513"
      strokeWidth="1.5"
      fill="none"
      className="animate-wood-grain-delayed"
    />
  </svg>
);

const CricketTrialsBanner: React.FC<CricketTrialsBannerProps> = ({
  announcement,
  onRegister,
  onClose,
  isVisible: controlledIsVisible,
  showCloseButton = true,
  apiEndpoint,
  className = ""
}) => {
  const [internalIsVisible, setInternalIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

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

  return (
    <>
      {/* Main animated component */}
      <section
        className={`w-full ${className} ${isVisible ? animationClass : 'opacity-0'}`}
        aria-label="Cricket Trials Announcement"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={bannerRef}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-green-50 border border-blue-200 shadow-2xl backdrop-blur-sm animate-modal-appear group"
            role="banner"
            aria-labelledby="trials-title"
            onMouseMove={handleMouseMove}
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y * 2 - 1}deg) rotateY(${mousePosition.x * 2 - 1}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Enhanced Background decoration with color-shifting gradients */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl animate-color-shift" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-green-400 to-teal-400 rounded-full blur-xl animate-color-shift-delayed" />
              <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full blur-xl animate-color-shift-slow" />
            </div>

            {/* Particle System */}
            <ParticleSystem isVisible={isVisible} />

            {/* Floating Cricket Elements */}
            <FloatingCricketElements isVisible={isVisible} />

            {/* Morphing Background Shapes */}
            <MorphingShapes isVisible={isVisible} />

            {/* Enhanced Close Button with hover effects */}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 group/close hover:scale-110 animate-float-gentle"
                aria-label="Close banner"
              >
                <svg
                  className="w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors duration-200"
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

            {/* Dynamic gradient overlay with color-shifting */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-green-600/10 backdrop-blur-sm animate-gradient-shift"></div>

            {/* Enhanced Animated background elements with glow effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-30 animate-pulse-glow shadow-lg shadow-blue-400/50"></div>
              <div className="absolute top-20 right-20 w-6 h-6 bg-green-400 rounded-full opacity-25 animate-pulse-glow-delayed shadow-lg shadow-green-400/50" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-10 left-20 w-3 h-3 bg-purple-500 rounded-full opacity-35 animate-pulse-glow-slow shadow-lg shadow-purple-500/50" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Spectacular bouncing cricket ball with enhanced effects */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 animate-bounce-spectacular z-0 opacity-70">
              <img
                src="/image_3.png"
                alt="Cricket Ball"
                className="w-full h-full object-contain animate-slow-spin drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))',
                }}
              />
            </div>

            <div className="relative p-6 sm:p-8 lg:p-10 text-center space-y-6 z-10">
              {/* Enhanced Content with staggered animations */}
              <div className="space-y-4">
                <div className={`transition-all duration-700 ${isVisible ? textAnimationClass : 'opacity-0'}`}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-4 shadow-lg animate-badge-glow">
                    <Users className="w-4 h-4 animate-pulse" />
                    {announcement.callout}
                  </div>
                </div>

                <h2
                  id="trials-title"
                  className={`text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 leading-tight transition-all duration-700 delay-100 ${isVisible ? textAnimationClass : 'opacity-0'}`}
                  style={{
                    background: 'linear-gradient(135deg, #1f2937, #3b82f6, #10b981)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% 200%',
                    animation: isVisible ? 'gradientShift 3s ease-in-out infinite' : 'none',
                  }}
                >
                  {announcement.title}
                </h2>

                <div
                  className={`space-y-3 text-gray-600 transition-all duration-700 delay-200 ${isVisible ? textAnimationClass : 'opacity-0'}`}
                >
                  <div className="flex items-center justify-center gap-2 text-xl font-semibold text-blue-700 animate-slide-in-from-left">
                    <MapPin className="w-6 h-6 animate-pulse" />
                    {announcement.venue}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xl font-semibold text-green-700 animate-slide-in-from-right">
                    <Calendar className="w-6 h-6 animate-pulse" />
                    {announcement.date}
                  </div>
                </div>

                <p
                  className={`text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto transition-all duration-700 delay-300 ${isVisible ? textAnimationClass : 'opacity-0'}`}
                >
                  {announcement.body}
                </p>

                {/* Spectacular CTA Button */}
                <div
                  className={`flex justify-center transition-all duration-700 delay-500 ${isVisible ? ctaAnimationClass : 'opacity-0 scale-75'}`}
                >
                  <button
                    onClick={onRegister}
                    className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white font-bold py-5 px-10 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 min-w-[200px] text-center hover:scale-110 active:scale-95 animate-glow-pulse overflow-hidden"
                    aria-label={`Register for ${announcement.title} at ${announcement.venue}`}
                  >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-white/30 rounded-full animate-ping" />
                      <div className="absolute top-4 right-3 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                    </div>

                    {/* Button content */}
                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                      <span className="hidden sm:inline">{announcement.ctaText}</span>
                      <span className="sm:hidden">Register</span>
                      <span className="animate-bounce">🏏</span>
                    </span>

                    {/* Enhanced hover effect overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-gradient-flow" />

                    {/* Ripple effect */}
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-active:opacity-100 animate-ping" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NoScript fallback */}
      <noscript>
        <section className={`w-full ${className}`} role="banner" aria-labelledby="trials-title-fallback">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 border border-blue-100 shadow-xl rounded-2xl p-6 sm:p-8 lg:p-10">
              {showCloseButton && onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200"
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
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  <Users className="w-4 h-4" />
                  {announcement.callout}
                </div>

                <h2 id="trials-title-fallback" className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
                  Upcoming Chennai Trials!
                </h2>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-700">
                    <MapPin className="w-5 h-5" />
                    {announcement.venue}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-700">
                    <Calendar className="w-5 h-5" />
                    {announcement.date}
                  </div>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  {announcement.body}
                </p>

                <button
                  onClick={onRegister}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
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

export default CricketTrialsBanner;

// Export types for reuse
export type { CricketTrialsAnnouncement, CricketTrialsBannerProps };

// Export SVG components for reuse
export { CricketBallIcon, CricketBatIcon };