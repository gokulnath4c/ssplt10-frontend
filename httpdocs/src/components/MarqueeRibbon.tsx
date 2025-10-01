import { Mail, Phone, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

const MarqueeRibbon = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const animationStateRef = useRef<'running' | 'paused'>('running');

  // Enhanced animation monitoring and restart logic
  useEffect(() => {
    const logAnimationState = (message: string, element?: HTMLElement) => {
      console.log(`[MarqueeRibbon] ${message}`, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        element: element ? {
          className: element.className,
          animationPlayState: getComputedStyle(element).animationPlayState,
          transform: getComputedStyle(element).transform
        } : null
      });
    };

    const forceAnimationRestart = (element: HTMLElement) => {
      const isMobile = window.innerWidth <= 599;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      // Log current state
      logAnimationState('Attempting to restart animation', element);

      // Force reflow and restart animation
      element.style.animation = 'none';
      element.style.webkitAnimation = 'none';
      element.offsetHeight; // Force reflow

      // Apply hardware acceleration
      element.style.transform = 'translate3d(0, 0, 0)';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';
      element.style.willChange = 'transform';

      // Set animation with vendor prefixes
      const duration = isMobile ? '25s' : '30s';
      element.style.animation = `marquee ${duration} linear infinite`;
      element.style.webkitAnimation = `marquee ${duration} linear infinite`;

      // Ensure animation is running
      element.style.animationPlayState = 'running';
      element.style.webkitAnimationPlayState = 'running';

      animationStateRef.current = 'running';
      logAnimationState('Animation restarted successfully', element);
    };

    const checkAndRestartAnimation = () => {
      if (!marqueeRef.current) return;

      const computedStyle = getComputedStyle(marqueeRef.current);
      const isAnimationPaused = computedStyle.animationPlayState === 'paused' ||
                               computedStyle.webkitAnimationPlayState === 'paused';

      if (isAnimationPaused && animationStateRef.current === 'running') {
        logAnimationState('Animation found paused, restarting...');
        forceAnimationRestart(marqueeRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && marqueeRef.current) {
        logAnimationState('Page became visible, checking animation state');
        setTimeout(() => checkAndRestartAnimation(), 100);
      }
    };

    const handleWindowResize = () => {
      if (marqueeRef.current) {
        logAnimationState('Window resized, restarting animation');
        forceAnimationRestart(marqueeRef.current);
      }
    };

    // Initial setup
    if (marqueeRef.current) {
      forceAnimationRestart(marqueeRef.current);
    }

    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleWindowResize);

    // Periodic animation checks
    const checkInterval = setInterval(checkAndRestartAnimation, 10000);

    // Mobile-specific optimizations
    const isMobile = window.innerWidth <= 599;
    if (isMobile) {
      // More frequent checks on mobile
      const mobileCheckInterval = setInterval(checkAndRestartAnimation, 5000);
      return () => {
        clearInterval(checkInterval);
        clearInterval(mobileCheckInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('resize', handleWindowResize);
      };
    }

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
  const contactInfo = [
    { 
      icon: Mail, 
      text: "Email: customercare@ssplt10.co.in", 
      type: "email" 
    },
    { 
      icon: Phone, 
      text: "Phone: +91 88077 75960", 
      type: "phone" 
    },
    { 
      icon: MessageCircle, 
      text: "WhatsApp: +91 88077 73632 (Support: 10:00 AM - 07:00 PM)", 
      type: "whatsapp" 
    }
  ];

  return (
    <div
      className="marquee-ribbon-container bg-[#C1E303] text-black py-1.5 px-4 overflow-hidden relative"
      style={{
        zIndex: 1001, // Higher than most content but below critical modals
        position: 'relative',
        isolation: 'isolate' // Create new stacking context
      }}
    >
      <div
        ref={marqueeRef}
        className="flex animate-marquee whitespace-nowrap min-w-full"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transform: 'translate3d(0, 0, 0)',
          contain: 'layout style paint'
        }}
      >
        {/* First set of contact info */}
        <div className="flex items-center space-x-8 mr-8 flex-shrink-0">
          {contactInfo.map((info, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs font-medium">
              <info.icon className="w-3 h-3 flex-shrink-0" />
              <span style={{ fontSize: '11px' }}>{info.text}</span>
            </div>
          ))}
        </div>

        {/* Duplicate set for seamless scrolling */}
        <div className="flex items-center space-x-8 mr-8 flex-shrink-0">
          {contactInfo.map((info, index) => (
            <div key={`duplicate-${index}`} className="flex items-center space-x-2 text-xs font-medium">
              <info.icon className="w-3 h-3 flex-shrink-0" />
              <span style={{ fontSize: '11px' }}>{info.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Animation state indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute top-0 right-0 text-xs opacity-50 pointer-events-none"
          style={{ fontSize: '8px' }}
        >
          {animationStateRef.current === 'running' ? '●' : '○'}
        </div>
      )}
    </div>
  );
};

export default MarqueeRibbon;