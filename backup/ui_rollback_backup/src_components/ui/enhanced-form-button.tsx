import React, { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFloatingAnimation } from '@/utils/animationUtils';
import { Loader2 } from 'lucide-react';

interface EnhancedFormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'glass' | 'gradient' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  floating?: boolean;
  ripple?: boolean;
  className?: string;
}

const EnhancedFormButton = forwardRef<HTMLButtonElement, EnhancedFormButtonProps>(({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  loadingText,
  floating = false,
  ripple = true,
  className,
  disabled,
  ...props
}, ref) => {
  const position = useFloatingAnimation();

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    default: 'bg-cricket-blue hover:bg-cricket-dark-blue text-white shadow-premium hover:shadow-glow',
    premium: 'bg-gradient-to-r from-cricket-electric-blue to-cricket-purple text-white shadow-glow hover:shadow-float border-2 border-cricket-gold/30',
    glass: 'glass-card bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-premium hover:shadow-float',
    gradient: 'bg-gradient-to-r from-cricket-gold via-cricket-orange to-cricket-gold text-cricket-blue shadow-glow hover:shadow-float border-2 border-cricket-gold/30',
    glow: 'bg-cricket-electric-blue text-white shadow-glow hover:shadow-float animate-pulse-glow'
  };

  const baseClasses = cn(
    "relative overflow-hidden transition-all duration-300 font-semibold rounded-lg",
    "focus:outline-none focus:ring-2 focus:ring-cricket-blue/20",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "group",
    sizeClasses[size],
    variantClasses[variant],
    floating && "hover:scale-105",
    loading && "cursor-not-allowed",
    className
  );

  return (
    <Button
      ref={ref}
      className={baseClasses}
      disabled={disabled || loading}
      style={floating ? {
        transform: `translate(${position.x * 0.1}px, ${position.y * 0.1}px)`
      } : undefined}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}

      {/* Button content */}
      <span className={cn(
        "transition-all duration-300",
        loading && "opacity-70"
      )}>
        {loading ? (loadingText || 'Loading...') : children}
      </span>

      {/* Floating animation indicator */}
      {floating && (
        <div
          className="absolute -top-1 -right-1 w-2 h-2 bg-cricket-gold rounded-full opacity-60"
          style={{
            transform: `translate(${position.x * 0.2}px, ${position.y * 0.2}px)`,
            transition: 'transform 0.1s linear'
          }}
        />
      )}

      {/* Ripple effect */}
      {ripple && (
        <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-active:opacity-100 transition-opacity duration-150" />
      )}

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      {/* Glow effect for premium variant */}
      {variant === 'premium' && (
        <div className="absolute inset-0 bg-gradient-to-r from-cricket-electric-blue/20 via-cricket-purple/20 to-cricket-electric-blue/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
      )}

      {/* Success state indicator */}
      {!loading && !disabled && (
        <div className="absolute inset-0 bg-green-500/20 rounded-lg opacity-0 group-active:opacity-100 transition-opacity duration-150" />
      )}
    </Button>
  );
});

EnhancedFormButton.displayName = 'EnhancedFormButton';

export { EnhancedFormButton };