import React from 'react';
import { useFloatingAnimation, useParticles, getRandomDelay } from '@/utils/animationUtils';

interface FloatingElementProps {
  type: 'orb' | 'particle' | 'geometric' | 'icon';
  size: 'sm' | 'md' | 'lg' | 'xl';
  color: 'blue' | 'gold' | 'purple' | 'orange' | 'green' | 'electric';
  animation: 'gentle' | 'moderate' | 'energetic';
  className?: string;
  style?: React.CSSProperties;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  type,
  size,
  color,
  animation,
  className = '',
  style = {}
}) => {
  const position = useFloatingAnimation();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'bg-cricket-blue',
    gold: 'bg-cricket-gold',
    purple: 'bg-cricket-purple',
    orange: 'bg-cricket-orange',
    green: 'bg-cricket-green',
    electric: 'bg-cricket-electric-blue'
  };

  const renderElement = () => {
    switch (type) {
      case 'orb':
        return (
          <div
            className={`rounded-full blur-sm opacity-60 ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: 'transform 0.1s linear',
              ...style
            }}
          />
        );
      case 'particle':
        return (
          <div
            className={`rounded-full ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: 'transform 0.1s linear',
              boxShadow: '0 0 10px currentColor',
              ...style
            }}
          />
        );
      case 'geometric':
        return (
          <div
            className={`border-2 border-current opacity-40 ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(${position.x * 0.1}deg)`,
              transition: 'transform 0.1s linear',
              borderRadius: type === 'geometric' ? '50%' : '4px',
              ...style
            }}
          />
        );
      case 'icon':
        const icons = ['✨', '⭐', '💫', '🌟', '🏏', '🏆'];
        return (
          <div
            className={`text-2xl ${className}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: 'transform 0.1s linear',
              color: `hsl(var(--cricket-${color === 'electric' ? 'electric-blue' : color}))`,
              ...style
            }}
          >
            {icons[Math.floor(Math.random() * icons.length)]}
          </div>
        );
      default:
        return null;
    }
  };

  return renderElement();
};

interface FloatingParticlesProps {
  count?: number;
  type?: 'stars' | 'sparkles' | 'bubbles';
  colors?: Array<'blue' | 'gold' | 'purple' | 'orange' | 'green' | 'electric'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 20,
  type = 'stars',
  colors = ['blue', 'gold', 'purple', 'electric'],
  size = 'sm',
  className = ''
}) => {
  const particles = useParticles();

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.slice(0, count).map((particle, index) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${getRandomDelay(0, 5000)}ms`,
            opacity: particle.opacity
          }}
        >
          <FloatingElement
            type="particle"
            size={size}
            color={colors[index % colors.length]}
            animation="gentle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${6000 + index * 1000}ms`
            }}
          />
        </div>
      ))}
    </div>
  );
};

interface FloatingOrbsProps {
  count?: number;
  colors?: Array<'blue' | 'gold' | 'purple' | 'orange' | 'green' | 'electric'>;
  sizes?: Array<'sm' | 'md' | 'lg' | 'xl'>;
  className?: string;
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({
  count = 5,
  colors = ['blue', 'purple', 'electric'],
  sizes = ['lg', 'xl'],
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${getRandomDelay(0, 3000)}ms`
          }}
        >
          <FloatingElement
            type="orb"
            size={sizes[index % sizes.length]}
            color={colors[index % colors.length]}
            animation="moderate"
            className="animate-pulse"
            style={{
              animationDuration: `${8000 + index * 2000}ms`
            }}
          />
        </div>
      ))}
    </div>
  );
};

interface GeometricShapesProps {
  count?: number;
  colors?: Array<'blue' | 'gold' | 'purple' | 'orange' | 'green' | 'electric'>;
  className?: string;
}

export const GeometricShapes: React.FC<GeometricShapesProps> = ({
  count = 8,
  colors = ['blue', 'gold', 'purple'],
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${getRandomDelay(1000, 4000)}ms`
          }}
        >
          <FloatingElement
            type="geometric"
            size="md"
            color={colors[index % colors.length]}
            animation="gentle"
            style={{
              animationDuration: `${7000 + index * 1500}ms`
            }}
          />
        </div>
      ))}
    </div>
  );
};

interface SparkleIconsProps {
  count?: number;
  className?: string;
}

export const SparkleIcons: React.FC<SparkleIconsProps> = ({
  count = 10,
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${getRandomDelay(500, 3000)}ms`
          }}
        >
          <FloatingElement
            type="icon"
            size="sm"
            color="gold"
            animation="energetic"
            style={{
              animationDuration: `${5000 + index * 1000}ms`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Combined premium floating elements component
interface PremiumFloatingElementsProps {
  variant?: 'minimal' | 'moderate' | 'abundant';
  className?: string;
}

export const PremiumFloatingElements: React.FC<PremiumFloatingElementsProps> = ({
  variant = 'moderate',
  className = ''
}) => {
  const configs = {
    minimal: {
      particles: 10,
      orbs: 2,
      shapes: 3,
      sparkles: 4
    },
    moderate: {
      particles: 20,
      orbs: 5,
      shapes: 8,
      sparkles: 10
    },
    abundant: {
      particles: 30,
      orbs: 8,
      shapes: 12,
      sparkles: 15
    }
  };

  const config = configs[variant];

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <FloatingParticles
        count={config.particles}
        type="stars"
        colors={['blue', 'gold', 'purple', 'electric']}
        size="sm"
      />
      <FloatingOrbs
        count={config.orbs}
        colors={['blue', 'purple', 'electric']}
        sizes={['lg', 'xl']}
      />
      <GeometricShapes
        count={config.shapes}
        colors={['blue', 'gold', 'purple']}
      />
      <SparkleIcons
        count={config.sparkles}
      />
    </div>
  );
};

export default PremiumFloatingElements;