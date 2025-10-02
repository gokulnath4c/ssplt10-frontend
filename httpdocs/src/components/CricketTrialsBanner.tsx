import React, { useEffect, useState, useRef } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import './CricketTrialsBanner.css';

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
      className="absolute inset-0 w-full h-full pointer-events-none cricket-trials-canvas"
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
    <div className="floating-cricket-container">
      {elements.map((element, index) => (
        <div
          key={index}
          className={`floating-cricket-element ${index === 0 ? 'left-20' : index === 1 ? 'left-40' : index === 2 ? 'left-60' : 'left-80'}`}
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
            className="banner-container-parallax banner-parallax relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-green-50 border border-blue-200 shadow-2xl animate-modal-appear group"
            role="banner"
            aria-labelledby="trials-title"
            onMouseMove={handleMouseMove}
            style={{
              '--rotate-x': `${mousePosition.y * 2 - 1}deg`,
              '--rotate-y': `${mousePosition.x * 2 - 1}deg`,
            } as React.CSSProperties}
          >
            {/* Enhanced Background decoration with color-shifting gradients */}
            <div className="background-decoration">
              <div className="background-decoration-element absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl" />
              <div className="background-decoration-element absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-green-400 to-teal-400 rounded-full blur-xl" />
              <div className="background-decoration-element absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full blur-xl" />
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
                className="close-button-enhanced"
                aria-label="Close banner"
              >
                <svg
                  className="w-5 h-5"
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
            <div className="gradient-overlay"></div>

            {/* Enhanced Animated background elements with glow effects */}
            <div className="animated-bg-elements">
              <div className="bg-element absolute top-10 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-30 shadow-lg shadow-blue-400/50"></div>
              <div className="bg-element absolute top-20 right-20 w-6 h-6 bg-green-400 rounded-full opacity-25 shadow-lg shadow-green-400/50"></div>
              <div className="bg-element absolute bottom-10 left-20 w-3 h-3 bg-purple-500 rounded-full opacity-35 shadow-lg shadow-purple-500/50"></div>
            </div>

            {/* Spectacular bouncing cricket ball with enhanced effects */}
            <div className="cricket-ball-image">
              <img
                src="/image_3.png"
                alt="Cricket Ball"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="content-container relative text-center space-y-6 z-10">
              {/* Enhanced Content with staggered animations */}
              <div className="space-y-4">
                <div className={`transition-all duration-700 ${isVisible ? textAnimationClass : 'opacity-0'}`}>
                  <div className="announcement-badge">
                    <Users className="w-4 h-4" />
                    {announcement.callout}
                  </div>
                </div>

                <h2
                  id="trials-title"
                  className={`title-gradient-text text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 leading-tight transition-all duration-700 delay-100 ${isVisible ? textAnimationClass : 'opacity-0'}`}
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
                    className="cta-button"
                    aria-label={`Register for ${announcement.title} at ${announcement.venue}`}
                  >
                    {/* Animated background particles */}
                    <div className="button-particles">
                      <div className="particle absolute top-2 left-2 w-2 h-2 bg-white/30 rounded-full" />
                      <div className="particle absolute top-4 right-3 w-1 h-1 bg-white/40 rounded-full" />
                      <div className="particle absolute bottom-3 left-4 w-1.5 h-1.5 bg-white/20 rounded-full" />
                    </div>

                    {/* Button content */}
                    <span className="button-content">
                      <span className="hidden sm:inline">{announcement.ctaText}</span>
                      <span className="sm:hidden">Register</span>
                      <span className="animate-bounce">🏏</span>
                    </span>

                    {/* Enhanced hover effect overlay */}
                    <div className="hover-overlay" />

                    {/* Ripple effect */}
                    <div className="ripple-effect" />
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